// External Dependencies
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { useQueryClient } from '@tanstack/react-query';

// Relative Dependencies
import { client } from '../lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.spaces)['update-space']['$post'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.spaces)['update-space']['$post']
>['json'];

export const useEditSpace = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.spaces['update-space'].$post({
        json,
      });

      if (!response.ok) {
        throw new Error('Unable to edit space');
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success('Space Updated');
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
    },
    onError: () => {},
  });

  return mutation;
};
