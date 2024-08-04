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
  );

export default app;
