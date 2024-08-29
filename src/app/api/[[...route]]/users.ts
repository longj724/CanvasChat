// External Dependencies
import { z } from 'zod';
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { getAuth } from '@hono/clerk-auth';

// Relative Dependencies
import { deleteApiKey, getApiKey, storeApiKey } from '@/lib/supabase';

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
    const ollamaUrl = await getApiKey(userId, 'ollama', supabaseToken);
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
        supabaseToken: z.string(),
        anthropicKey: z.string().optional(),
        groqKey: z.string().optional(),
        ollamaURL: z.string().optional(),
        openAIKey: z.string().optional(),
      })
    ),
    async (c) => {
      const { supabaseToken, anthropicKey, groqKey, ollamaURL, openAIKey } =
        c.req.valid('json');
      const auth = getAuth(c);

      if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const userId = auth.userId;

      try {
        // Explicity check for undefined - it is okay if the key is an emtpy string
        if (openAIKey !== undefined) {
          await deleteApiKey(userId, 'openAI', supabaseToken);
          await storeApiKey(userId, 'openAI', openAIKey, supabaseToken);
        }

        if (groqKey !== undefined) {
          await deleteApiKey(userId, 'groq', supabaseToken);
          await storeApiKey(userId, 'groq', groqKey, supabaseToken);
        }

        if (ollamaURL !== undefined) {
          await deleteApiKey(userId, 'ollamaUrl', supabaseToken);
          await storeApiKey(userId, 'ollamaUrl', ollamaURL, supabaseToken);
        }

        if (anthropicKey !== undefined) {
          await deleteApiKey(userId, 'anthropic', supabaseToken);
          await storeApiKey(userId, 'anthropic', anthropicKey, supabaseToken);
        }
      } catch (error) {
        console.error('Error updating API keys:', error);
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
