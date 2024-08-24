// External Dependencies
import { useQuery } from '@tanstack/react-query';
import { InferResponseType } from 'hono';
import { client } from '@/lib/hono';

// Relative Dependencies

interface Model {
  name: string;
}

export type MessagesResponseType = InferResponseType<
  (typeof client.api.messages)['ollama-models'],
  200
>;

export const useGetOllamaModels = () => {
  const query = useQuery({
    queryKey: ['ollama-models'],
    queryFn: async () => {
      const response = await client.api.messages['ollama-models'].$get();

      if (!response.ok) {
        throw new Error('Failed to fetch spaces');
      }

      const models = (await response.json()).data.models as Model[];

      return models;
    },
  });

  return query;
};
