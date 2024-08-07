// External Dependencies
import { toast } from 'sonner';
import { InferRequestType, InferResponseType } from 'hono';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Relative Dependencies
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.messages)[':messageId']['$delete'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.messages)[':messageId']['$delete']
>['param'];

export const useDeleteMessage = (spaceId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (param) => {
      const response = await client.api.messages[':messageId'].$delete({
        param,
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', spaceId] });
    },
    onError: () => {
      toast.error('Failed to delete message');
    },
  });

  return mutation;
};
