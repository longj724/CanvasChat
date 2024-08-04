// External Dependencies
import { InferResponseType } from 'hono';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

export type MessagesResponseType = InferResponseType<
  (typeof client.api.messages)[':spaceId']['$get'],
  200
>;

export const useGetMessages = (spaceId: string) => {
  const query = useQuery({
    enabled: !!spaceId,
    queryKey: ['messages', spaceId],
    queryFn: async () => {
      const response = await client.api.messages[':spaceId'].$get({
        param: { spaceId },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
