// External Dependencies
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { InferRequestType, InferResponseType } from 'hono';

// Relative Dependencies
import { client } from '../lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.messages)['search']['$post'],
  200
>;

type RequestType = InferRequestType<
  (typeof client.api.messages)['search']['$post']
>['json'];

export const useSearchMessages = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.messages.search.$post({
        json,
      });

      if (!response.ok) {
        throw new Error('Failed to search messages');
      }

      return await response.json();
    },
    onError: (error) => {
      toast.error('Failed to search messages');
    },
  });

  return mutation;
};
