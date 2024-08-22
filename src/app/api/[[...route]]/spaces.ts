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
  .post(
    '/update-space',
    zValidator(
      'json',
      z.object({
        spaceId: z.string(),
        name: z.string().optional(),
      })
    ),
    async (c) => {
      const body = c.req.valid('json');
      const auth = getAuth(c);

      if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const updateData: Partial<typeof spaces.$inferInsert> = {};

      if ('name' in body) {
        updateData.name = body.name;
      }

      if (Object.keys(updateData).length === 0) {
        return c.json({ message: 'No updates provided' }, 400);
      }

      const newSpace = await db
        .update(spaces)
        .set(updateData)
        .where(eq(spaces.id, body.spaceId));

      return c.json({
        data: {
          space: newSpace,
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
