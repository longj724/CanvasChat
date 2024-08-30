// External Dependencies
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';
import { update } from 'lodash';

// Relative Dependencies

export const useUpdateApiKeys = () => {
  const { getToken } = useAuth();

  const mutation = useMutation({
    mutationFn: async ({
      anthropicKey,
      openAIKey,
      groqKey,
      ollamaUrl,
    }: {
      anthropicKey?: string;
      openAIKey?: string;
      groqKey?: string;
      ollamaUrl?: string;
    }) => {
      const token = await getToken({ template: 'supabase' });

      if (!token) {
        throw new Error('Failed to delete file');
      }

      const response = await fetch('/api/users/update-api-keys', {
        method: 'POST',
        body: JSON.stringify({
          anthropicKey,
          openAIKey,
          groqKey,
          ollamaUrl,
        }),
        headers: {
          SupabaseToken: token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update API keys');
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success('API Keys updated');
    },
    onError: () => {
      toast.error('Failed to update API Keys');
    },
  });

  return {
    updateApiKeysMutation: mutation,
    isLoading: mutation.isPending,
  };
};
