'use client';

import TldrawWithAIComponent from './TldrawApp';
import EditorCanvas from '../components/editor-canvas';

export default function Home() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      {/* <TldrawWithAIComponent /> */}
      <EditorCanvas />
    </div>
  );
}
