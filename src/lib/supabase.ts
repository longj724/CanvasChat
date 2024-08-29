// External Dependencies
import { createClient } from '@supabase/supabase-js';

export const supabaseClient = async (supabaseToken: string) => {
  const supabase = createClient(
    process.env.SUPABASE_PRODUCTION_API_URL!,
    process.env.SUPABASE_PRODUCTION_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${supabaseToken}` } },
    }
  );
  return supabase;
};

export const storeApiKey = async (
  userId: string,
  apiKeyName: string,
  apiKey: string,
  supabaseToken: string
) => insertSecret(buildApiKeyName(apiKeyName, userId), apiKey, supabaseToken);

const buildApiKeyName = (keyName: string, userId: string) => {
  return `${userId}_${keyName}_key`;
};

const insertSecret = async (
  name: string,
  secret: string,
  supabaseToken: string
) => {
  const supabase = await supabaseClient(supabaseToken);
  supabase.rpc('insert_secret', {
    name,
    secret,
  });
};

const getSecret = async (secretName: string, supabaseToken: string) => {
  const supabase = await supabaseClient(supabaseToken);
  const { data } = await supabase.rpc('read_secret', {
    secret_name: secretName,
  });
  return data;
};

export async function getApiKey(
  apiKeyName: string,
  userId: string,
  supbaseToken: string
) {
  return getSecret(buildApiKeyName(userId, apiKeyName), supbaseToken);
}

export async function deleteApiKey(
  apiKeyName: string,
  userId: string,
  supabaseToken: string
) {
  return deleteSecret(buildApiKeyName(apiKeyName, userId), supabaseToken);
}

const deleteSecret = async (secretName: string, supabaseToken: string) => {
  const supabase = await supabaseClient(supabaseToken);

  return supabase.rpc('delete_secret', {
    secret_name: secretName,
  });
};
