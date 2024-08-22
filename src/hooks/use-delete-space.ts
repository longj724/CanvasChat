// External Dependencies
import { toast } from 'sonner';
import { InferRequestType, InferResponseType } from 'hono';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

// Relative Dependencies
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.spaces)[':spaceId']['$delete'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.spaces)[':spaceId']['$delete']
>['param'];

export const useDeleteSpace = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (param) => {
      const response = await client.api.spaces[':spaceId'].$delete({
        param,
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
      router.push('/');
    },
    onError: () => {
      toast.error('Failed to delete space');
    },
  });

  return mutation;
};
