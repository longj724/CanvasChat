// External Dependencies
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

// Relative Dependencies
import { client } from '../lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.messages)['update-message']['$post'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.messages)['update-message']['$post']
>['json'];

export const useUpdateMessage = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.messages['update-message'].$post({
        json,
      });

      if (!response.ok) {
        throw new Error('Something went wrong');
      }

      return await response.json();
    },
    onError: () => {},
  });

  return mutation;
};
