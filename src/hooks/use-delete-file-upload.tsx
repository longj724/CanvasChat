// External Dependencies
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';

// Relative Dependencies

export const useDeleteFileUpload = () => {
  const { getToken } = useAuth();

  const mutation = useMutation({
    mutationFn: async ({
      messageId,
      imageId,
    }: {
      messageId: string;
      imageId: string;
    }) => {
      const token = await getToken({ template: 'supabase' });
      if (!token) {
        throw new Error('Failed to delete file');
      }

      const response = await fetch(`/api/messages/${messageId}/${imageId}`, {
        method: 'DELETE',
        headers: {
          SupabaseToken: token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      return await response.json();
    },
  });

  return mutation;
};
