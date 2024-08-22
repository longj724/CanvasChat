// External Dependencies
import { z } from 'zod';
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { getAuth } from '@hono/clerk-auth';

// Relative Dependencies
import { db } from '@/db';
import { spaces } from '@/db/schema';
import { eq } from 'drizzle-orm';

const app = new Hono()
  .post(
    '/create-space',
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
  .delete(
    '/:spaceId',
    zValidator('param', z.object({ spaceId: z.string() })),
    async (c) => {
      const { spaceId } = c.req.valid('param');
      const auth = getAuth(c);

      if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      await db.delete(spaces).where(eq(spaces.id, spaceId));

      return c.json({
        data: {
          spaceId,
        },
      });
    }
  )
  .get('/', async (c) => {
    const auth = getAuth(c);

    if (!auth?.userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const allSpaces = await db
      .select()
      .from(spaces)
      .where(eq(spaces.userId, auth.userId));

    return c.json({
      data: {
        spaces: allSpaces,
      },
    });
  });

export default app;
