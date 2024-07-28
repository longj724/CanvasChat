// External Dependencies
import { z } from 'zod';
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { getAuth } from '@hono/clerk-auth';

// Relative Dependencies
import { db } from '@/db';
import { spaces } from '@/db/schema';

const app = new Hono().post(
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
);

export default app;
