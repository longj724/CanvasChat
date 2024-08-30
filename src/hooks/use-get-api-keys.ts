// External Dependencies
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';

export const useGetApiKeys = () => {
  const { getToken } = useAuth();
  const query = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const token = await getToken({ template: 'supabase' });
      if (!token) {
        throw new Error('Failed to retrieve API keys');
      }

      const response = await fetch(`/api/users/api-keys`, {
        method: 'GET',
        headers: {
          SupabaseToken: token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve API keys');
      }

      return (await response.json()).data as {
        apiKeys: {
          anthropic: string;
          groq: string;
          ollamaUrl: string;
          openAI: string;
        };
      };
    },
  });

  return query;
};
