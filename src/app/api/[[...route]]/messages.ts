// External Dependencies
import { z } from 'zod';
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { getAuth } from '@hono/clerk-auth';
import { encode } from 'gpt-tokenizer';
import { CoreMessage, streamText } from 'ai';
import { eq, or, sql } from 'drizzle-orm';
import axios from 'axios';

// Relative Dependencies
import { db } from '@/db';
import { edges, messages, models } from '@/db/schema';
import { modelNameToProvider } from '@/lib/utils';

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
      })
    ),
    async (c) => {
      const { messageId, userMessage, model, previousMessageContext } =
        c.req.valid('json');
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

      // Don't want this check, going to use default context window for ollama
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

    const { data } = await axios.get('http://localhost:11434/api/tags', {
      method: 'GET',
    });

    console.log('models', data.models);

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
