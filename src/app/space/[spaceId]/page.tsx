'use client';

// External Dependencies
import { ReactFlowProvider } from '@xyflow/react';

// Relative Dependencies
import MessageCanvas from '@/components/MessageCanvas';

export default function Home() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <ReactFlowProvider>
        <MessageCanvas />
      </ReactFlowProvider>
    </div>
  );
}
