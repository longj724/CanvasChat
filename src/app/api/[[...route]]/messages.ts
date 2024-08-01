// External Dependencies
import { z } from 'zod';
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { getAuth } from '@hono/clerk-auth';

// Relative Dependencies
import { db } from '@/db';
import { spaces, messages } from '@/db/schema';
import { eq } from 'drizzle-orm';

const app = new Hono()
  .post(
    '/create-chat',
    zValidator(
      'json',

      z.object({
        name: z.string(),
      })
    ),
    async (c) => {
      const { name } = c.req.valid('json');
      const auth = getAuth(c);

      if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const newSpace = await db
        .insert(spaces)
        .values({ name, userId: auth.userId })
        .returning();

      return c.json({
        data: {
          space: newSpace,
        },
      });
    }
  )
  .get(
    '/',
    zValidator(
      'json',

      z.object({
        spaceId: z.string(),
      })
    ),
    async (c) => {
      const { spaceId } = c.req.valid('json');
      const auth = getAuth(c);

      if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const allMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.spaceId, spaceId));

      return c.json({
        data: {
          messages: allMessages,
        },
      });
    }
  );

export default app;
