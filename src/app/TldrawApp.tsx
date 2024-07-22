import { useMemo } from 'react';
import { Editor, Tldraw } from 'tldraw';
import { AIComponentUtil } from './AIComponentIntegration';

function TldrawWithAIComponent() {
  const shapeUtils = useMemo(() => [AIComponentUtil], []);

  return (
    <Tldraw
      shapeUtils={shapeUtils}
      onMount={(editor: Editor) => {
        editor.createShapes([
          {
            type: 'ai-component',
            props: { w: 1000, h: 1000, componentCode: 'hello' },
          },
        ]);
        editor.user.updateUserPreferences({ isSnapMode: true });
      }}
    />
  );
}

export default TldrawWithAIComponent;
