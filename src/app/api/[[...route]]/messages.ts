// External Dependencies
import { z } from 'zod';
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { getAuth } from '@hono/clerk-auth';
import { encode } from 'gpt-tokenizer';
import { CoreMessage, streamText } from 'ai';
import { eq, or, sql } from 'drizzle-orm';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Relative Dependencies
import { db } from '@/db';
import { edges, messages, models } from '@/db/schema';
import { modelNameToProvider } from '@/lib/utils';
import { supabaseClient } from '@/lib/supabase';

const app = new Hono()
  .post(
    '/send-message',
    zValidator(
      'json',
      z.object({
        messageId: z.string(),
        userMessage: z.string(),
        model: z.string(),
        previousMessageContext: z.string(),
        fileUrls: z.string().array().optional(),
      })
    ),
    async (c) => {
      const {
        messageId,
        userMessage,
        model,
        previousMessageContext,
        fileUrls,
      } = c.req.valid('json');
      const auth = getAuth(c);

      if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const previousMessages: CoreMessage[] = JSON.parse(
        previousMessageContext
      );

      const modelRow = await db
        .select()
        .from(models)
        .where(eq(models.name, model));

      if (fileUrls?.length && !modelRow[0].acceptsImages) {
        return c.json({ error: 'Model does not accept images' }, 400);
      }

      // Don't want this check, going to use default context window as 4096
      // if (!modelRow.length) {
      //   if (!auth?.userId) {
      //     return c.json(
      //       { error: "Couldn't connect to model to send message" },
      //       401
      //     );
      //   }
      // }

      const tokenLimit = modelRow.length ? modelRow[0].contextWindow : 4096;
      let tokensUsed = 0;

      const newMessageTokens = encode(userMessage).length;
      tokensUsed += newMessageTokens;

      // This is best estimate I could fine - apparently accurate for OpenAI
      tokensUsed += (fileUrls?.length ?? 0) * 85;

      if (tokensUsed > tokenLimit) {
        return c.json({ error: 'Message is too long' }, 400);
      }

      const newMessage: CoreMessage = {
        role: 'user',
        content: userMessage,
      };

      let allMessages: CoreMessage[] = [];

      let curMessageIndex = previousMessages.length - 1;
      while (
        tokensUsed < tokenLimit &&
        previousMessages &&
        curMessageIndex >= 0
        // && !chat?.exclude_prior_messages
      ) {
        const nextMessage = previousMessages[curMessageIndex];
        const nextMessageTokens = encode(nextMessage.content as string).length;

        tokensUsed += nextMessageTokens;

        if (tokensUsed > tokenLimit) {
          break;
        }

        allMessages.unshift(nextMessage);

        curMessageIndex--;
      }

      // Put new message at the end
      allMessages.push(newMessage);

      if (fileUrls?.length) {
        fileUrls.forEach((fileUrl) => {
          allMessages.push({
            role: 'user',
            content: [{ type: 'image', image: new URL(fileUrl) }],
          });
        });
      }

      const result = await streamText({
        model: modelNameToProvider(model),
        messages: allMessages,
      });

      return result.toTextStreamResponse();
    }
  )
  .get('/ollama-models', async (c) => {
    const auth = getAuth(c);

    if (!auth?.userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data } = await axios.get('http://localhost:11434/api/tags');

    return c.json({
      data: {
        models: data.models,
      },
    });
  })
  .post(
    '/create-chained-message',
    zValidator(
      'json',
      z.object({
        spaceId: z.string(),
        xPosition: z.number(),
        yPosition: z.number(),
        messageId: z.string(),
        previousMesageContext: z.string(),
      })
    ),
    async (c) => {
      const { spaceId, xPosition, yPosition, messageId } = c.req.valid('json');
      const auth = getAuth(c);

      if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const newMessage = await db
        .insert(messages)
        .values({
          spaceId,
          modelName: 'gpt-4o',
          xPosition: String(xPosition),
          yPosition: String(yPosition),
          previousMessageContext: messageId,
        })
        .returning();

      return c.json({
        data: {
          message: newMessage,
        },
      });
    }
  )
  .post(
    '/create-root-message',
    zValidator(
      'json',
      z.object({
        spaceId: z.string(),
        width: z.number(),
        xPosition: z.number(),
        yPosition: z.number(),
      })
    ),
    async (c) => {
      const { spaceId, width, xPosition, yPosition } = c.req.valid('json');
      const auth = getAuth(c);

      if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const newMessage = await db
        .insert(messages)
        .values({
          spaceId,
          modelName: 'gpt-4o',
          width: String(width),
          xPosition: String(xPosition),
          yPosition: String(yPosition),
        })
        .returning();

      return c.json({
        data: {
          message: newMessage,
        },
      });
    }
  )
  .post('/image-upload', async (c) => {
    const auth = getAuth(c);

    if (!auth?.userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as File | null;
    const messageId = formData.get('messageId') as string | null;
    const supabaseToken = formData.get('supabaseToken') as string | null;

    if (!file || !messageId || !supabaseToken) {
      return c.json({ error: 'Error uploading file' }, 400);
    }

    const supabase = await supabaseClient(supabaseToken);

    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();

    const { data, error } = await supabase.storage
      .from('images') // Replace with your bucket name
      .upload(`${auth.userId}/${fileName}`, arrayBuffer, {
        contentType: file.type,
      });

    if (error) {
      console.error('Error uploading file:', error);
      return c.json({ error: 'Failed to upload file' }, 500);
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from('images')
      .getPublicUrl(`${auth.userId}/${fileName}`);

    await db
      .update(messages)
      .set({
        imageUrl: sql`array_append(${messages.imageUrl}::text[], ${publicUrl})`,
      })
      .where(eq(messages.id, messageId))
      .returning();

    return c.json({
      data: {
        imageId: fileName,
        publicUrl,
      },
    });
  })
  .post(
    '/create-child-message',
    zValidator(
      'json',
      z.object({
        createdFrom: z.enum(['top', 'bottom', 'left', 'right']),
        model: z.string(),
        parentMessageId: z.string(),
        previousMessageContext: z.string(),
        spaceId: z.string(),
        width: z.number(),
        xPosition: z.number(),
        yPosition: z.number(),
      })
    ),
    async (c) => {
      const {
        createdFrom,
        model,
        parentMessageId,
        previousMessageContext,
        spaceId,
        width,
        xPosition,
        yPosition,
      } = c.req.valid('json');
      const auth = getAuth(c);

      if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const newMessage = await db
        .insert(messages)
        .values({
          createdFrom: createdFrom,
          modelName: model,
          previousMessageContext: previousMessageContext,
          spaceId,
          width: String(width),
          xPosition: String(xPosition),
          yPosition: String(yPosition),
        })
        .returning();

      const newEdge = await db
        .insert(edges)
        .values({
          spaceId,
          sourceId: parentMessageId,
          targetId: newMessage[0].id,
        })
        .returning();

      return c.json({
        data: {
          message: newMessage,
          edge: newEdge,
        },
      });
    }
  )
  .get(
    '/:spaceId',
    zValidator('param', z.object({ spaceId: z.string() })),
    async (c) => {
      const { spaceId } = c.req.valid('param');
      const auth = getAuth(c);

      if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const allMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.spaceId, spaceId));

      const allEdges = await db
        .select()
        .from(edges)
        .where(eq(edges.spaceId, spaceId));

      return c.json({
        data: {
          messages: allMessages,
          edges: allEdges,
        },
      });
    }
  )
  .post(
    '/update-message',
    zValidator(
      'json',
      z.object({
        messageId: z.string(),
        xPosition: z.number().optional(),
        yPosition: z.number().optional(),
        model: z.string().optional(),
        userMessage: z.string().optional(),
        response: z.string().optional(),
        width: z.number().optional(),
      })
    ),
    async (c) => {
      const body = c.req.valid('json');
      const auth = getAuth(c);

      if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const updateData: Partial<typeof messages.$inferInsert> = {};

      if ('xPosition' in body) {
        updateData.xPosition = String(body.xPosition);
      }

      if ('yPosition' in body) {
        updateData.yPosition = String(body.yPosition);
      }

      if ('model' in body) {
        const modelRow = await db
          .select()
          .from(models)
          .where(eq(models.name, body.model as string));

        if (!modelRow.length) {
          const { data } = await axios.post('http://localhost:11434/api/show', {
            name: body.model as string,
          });

          const contextWindow = data.model_info[
            'llama.context_length'
          ] as number;

          // For now not supporting local models that accept images
          await db.insert(models).values({
            name: body.model as string,
            acceptsImages: false,
            contextWindow: contextWindow,
          });
        }

        updateData.modelName = body.model;
      }

      if ('userMessage' in body) {
        updateData.userMessage = body.userMessage;
      }

      if ('response' in body) {
        updateData.response = body.response;
      }

      if ('width' in body) {
        updateData.width = String(body.width);
      }

      if (Object.keys(updateData).length === 0) {
        return c.json({ message: 'No updates provided' }, 400);
      }

      const newMessage = await db
        .update(messages)
        .set(updateData)
        .where(eq(messages.id, body.messageId));

      return c.json({
        data: {
          message: newMessage,
        },
      });
    }
  )
  .delete(
    '/:messageId',
    zValidator('param', z.object({ messageId: z.string() })),
    async (c) => {
      const { messageId } = c.req.valid('param');
      const auth = getAuth(c);

      if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const message = await db
        .delete(messages)
        .where(eq(messages.id, messageId));

      return c.json({
        data: {
          message: message,
        },
      });
    }
  )
  .delete(
    '/:messageId/:imageId',
    zValidator(
      'param',
      z.object({ messageId: z.string(), imageId: z.string() })
    ),
    async (c) => {
      const { messageId, imageId } = c.req.valid('param');
      const auth = getAuth(c);

      if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const supabaseToken = c.req.header('SupabaseToken') as string;

      if (!supabaseToken) {
        return c.json({ error: 'Supabase token missing' }, 401);
      }

      const supabase = await supabaseClient(supabaseToken);

      const { error } = await supabase.storage
        .from('images')
        .remove([`${auth.userId}/${imageId}`]);

      if (error) {
        console.error('Error deleting file:', error);
        return c.json({ error: 'Failed to delete file' }, 500);
      }

      await db
        .update(messages)
        .set({
          imageUrl: sql`array_remove(${messages.imageUrl}::text[], ${imageId})`,
        })
        .where(eq(messages.id, messageId))
        .returning();

      return c.json({
        data: {
          message: 'Successfully deleted file',
        },
      });
    }
  )
  .post(
    '/search',
    zValidator(
      'json',
      z.object({
        searchValue: z.string(),
      })
    ),
    async (c) => {
      // TODO: Not used right now
      const { searchValue } = c.req.valid('json');
      const auth = getAuth(c);

      if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const matchingMesesages = await db
        .select()
        .from(messages)
        .where(
          or(
            sql`to_tsvector('english', ${messages.userMessage}) @@ websearch_to_tsquery('english', ${searchValue})`,
            sql`to_tsvector('english', ${messages.response}) @@ websearch_to_tsquery('english', ${searchValue})`
          )
        );

      return c.json({
        data: {
          messages: matchingMesesages,
        },
      });
    }
  );

export default app;
