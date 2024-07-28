// External Dependencies
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';

// Relative Dependencies
import { client } from '../lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.spaces)['create-space']['$post'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.spaces)['create-space']['$post']
>['json'];

export const useCreateSpace = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.spaces['create-space'].$post({ json });

      if (!response.ok) {
        throw new Error('Something went wrong');
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success('Space created');

      // queryClient.invalidateQueries({ queryKey: ['spaces'] });
    },
    onError: () => {
      toast.error('Failed to create space');
    },
  });

  return mutation;
};
