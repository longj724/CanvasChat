'use client';

// External Dependencies
import { useState } from 'react';
import { type ThemeProviderProps } from 'next-themes/dist/types';
import { type FC } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider } from '@clerk/nextjs';

export const Providers: FC<ThemeProviderProps> = ({ children, ...props }) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ClerkProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ClerkProvider>
  );
};
