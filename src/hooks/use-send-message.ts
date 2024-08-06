// External Dependencies
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { InferRequestType } from 'hono';

// Relative Dependencies
import { client } from '../lib/hono';

type RequestType = InferRequestType<
  (typeof client.api.messages)['send-message']['$post']
>['json'];

export const useSendMessage = () => {
  const [streamingResponse, setStreamingResponse] = useState<string | null>(
    null
  );

  const mutation = useMutation<string, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.messages['send-message'].$post({
        json,
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      let fullResponse = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value, { stream: true });
        fullResponse += chunk;
        setStreamingResponse(fullResponse);
      }

      return fullResponse;
    },
    onError: (error) => {
      toast.error(`Failed to send message: ${error.message}`);
    },
  });

  return {
    sendMessage: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    streamingResponse,
  };
};
