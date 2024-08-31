// External Dependencies
import { z } from 'zod';
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { getAuth } from '@hono/clerk-auth';

// Relative Dependencies
import { getApiKey, storeApiKey } from '@/lib/supabase';

const app = new Hono()
  .get('/api-keys', async (c) => {
    const auth = getAuth(c);

    if (!auth?.userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabaseToken = c.req.header('SupabaseToken') as string;

    if (!supabaseToken) {
      return c.json({ error: 'Supabase token missing' }, 401);
    }

    const userId = auth.userId;

    const openAIKey = await getApiKey(userId, 'openAI', supabaseToken);
    const groqKey = await getApiKey(userId, 'groq', supabaseToken);
    const ollamaUrl = await getApiKey(userId, 'ollamaUrl', supabaseToken);
    const anthropicKey = await getApiKey(userId, 'anthropic', supabaseToken);

    const apiKeys = {
      anthropic: anthropicKey,
      groq: groqKey,
      ollamaUrl: ollamaUrl,
      openAI: openAIKey,
    };

    return c.json({
      data: {
        apiKeys,
      },
    });
  })
  .post(
    '/update-api-keys',
    zValidator(
      'json',
      z.object({
        anthropicKey: z.string().optional(),
        groqKey: z.string().optional(),
        ollamaUrl: z.string().optional(),
        openAIKey: z.string().optional(),
      })
    ),
    async (c) => {
      // Not sure why c.req.valid('json') doesn't work here
      const { anthropicKey, groqKey, ollamaUrl, openAIKey } =
        await c.req.json();

      const auth = getAuth(c);

      if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const supabaseToken = c.req.header('SupabaseToken') as string;

      if (!supabaseToken) {
        return c.json({ error: 'Supabase token missing' }, 401);
      }

      const userId = auth.userId;

      try {
        // Explicity check for undefined - it is okay if the key is an emtpy string
        if (openAIKey !== undefined) {
          await storeApiKey(userId, 'openAI', openAIKey, supabaseToken);
        }

        if (groqKey !== undefined) {
          await storeApiKey(userId, 'groq', groqKey, supabaseToken);
        }

        if (ollamaUrl !== undefined) {
          await storeApiKey(userId, 'ollamaUrl', ollamaUrl, supabaseToken);
        }

        if (anthropicKey !== undefined) {
          await storeApiKey(userId, 'anthropic', anthropicKey, supabaseToken);
        }
      } catch (error) {
        return c.json({ error: 'Failed to update API keys' }, 500);
      }

      return c.json({
        data: {
          message: 'SUCCESS',
        },
      });
    }
  );

export default app;
