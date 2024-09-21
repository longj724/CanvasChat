'use client';

// External Dependencies
import { ReactFlowProvider } from '@xyflow/react';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { Suspense } from 'react';

// Relative Dependencies
import MessageCanvas from '../components/MessageCanvas';
import LandingPage from '../components/LandingPage';

export default function Home() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <ReactFlowProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <SignedIn>
            <MessageCanvas />
          </SignedIn>
          <SignedOut>
            <LandingPage />
          </SignedOut>
        </Suspense>
      </ReactFlowProvider>
    </div>
  );
}
