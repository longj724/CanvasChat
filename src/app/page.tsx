'use client';

// External Dependencies
import { ReactFlowProvider } from '@xyflow/react';
import { Suspense } from 'react';

// Relative Dependencies
import MessageCanvas from '../components/MessageCanvas';

export default function Home() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <ReactFlowProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <MessageCanvas />
        </Suspense>
      </ReactFlowProvider>
    </div>
  );
}
