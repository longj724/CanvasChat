// External Dependencies
import { useQuery } from '@tanstack/react-query';
import { InferResponseType } from 'hono';
import { client } from '@/lib/hono';
import axios from 'axios';

// Relative Dependencies
import { useGetApiKeys } from './use-get-api-keys';

interface Model {
  name: string;
}

export type MessagesResponseType = InferResponseType<
  (typeof client.api.messages)['ollama-models'],
  200
>;

export const useGetOllamaModels = () => {
  const { data } = useGetApiKeys();

  const query = useQuery({
    queryKey: ['ollama-models'],
    queryFn: async () => {
      if (!data?.apiKeys?.ollamaUrl) {
        throw new Error('No ollama url');
      }

      const response = await axios.get(`${data?.apiKeys?.ollamaUrl}/api/tags`);

      if (response.status !== 200) {
        throw new Error('Failed to local ollama models');
      }

      const models = (await response.data).models as Model[];

      return models;
    },
  });

  return query;
};
