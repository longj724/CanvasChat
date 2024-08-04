// External Dependencies
import { z } from 'zod';
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { getAuth } from '@hono/clerk-auth';

// Relative Dependencies
import { db } from '@/db';
import { edges, messages } from '@/db/schema';
import { eq } from 'drizzle-orm';

const app = new Hono()
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
        xPosition: z.number(),
        yPosition: z.number(),
      })
    ),
    async (c) => {
      const { spaceId, xPosition, yPosition } = c.req.valid('json');
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
        })
        .returning();

      return c.json({
        data: {
          message: newMessage,
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
  );

export default app;
