'use client';

// External Dependencies
import { ReactFlowProvider } from '@xyflow/react';

// Relative Dependencies
import EditorCanvas from '@/components/editor-canvas';

export default function Home() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <ReactFlowProvider>
        <EditorCanvas />
      </ReactFlowProvider>
    </div>
  );
}
