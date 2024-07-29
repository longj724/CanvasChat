// External Dependencies
import { InferResponseType } from 'hono';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

export type SpacesResponseType = InferResponseType<
  typeof client.api.spaces.$get,
  200
>;

export const useGetSpaces = () => {
  const query = useQuery({
    queryKey: ['spaces'],
    queryFn: async () => {
      const response = await client.api.spaces.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch spaces');
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
