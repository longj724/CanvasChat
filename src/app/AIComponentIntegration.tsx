import { useRef, useState, useEffect } from 'react';
import {
  BaseBoxShapeUtil,
  HTMLContainer,
  T,
  TLBaseShape,
  TLOnResizeHandler,
  useEditor,
} from 'tldraw';
import ExampleCard from './exampleCard';

type AIComponentShape = TLBaseShape<
  'ai-component',
  {
    w: number;
    h: number;
    componentCode: string;
  }
>;

export class AIComponentUtil extends BaseBoxShapeUtil<AIComponentShape> {
  static type = 'ai-component' as const;

  static props = {
    w: T.number,
    h: T.number,
    componentCode: T.string,
  };

  static migrations = undefined;

  canResize = () => true;
  canBind = () => true;

  getDefaultProps(): AIComponentShape['props'] {
    return {
      w: 0,
      h: 0,
      componentCode: '',
    };
  }

  override onResize: TLOnResizeHandler<AIComponentShape> = (shape, info) => {
    const { initialShape, scaleX, scaleY } = info;

    let newWidth = Math.max(1, initialShape.props.w * scaleX);
    let newHeight = Math.max(1, initialShape.props.h * scaleY);

    const aspectRatio = initialShape.props.w / initialShape.props.h;
    if (newWidth / newHeight > aspectRatio) {
      newWidth = newHeight * aspectRatio;
    } else {
      newHeight = newWidth / aspectRatio;
    }

    newWidth = Math.round(newWidth);
    newHeight = Math.round(newHeight);

    return {
      id: shape.id,
      type: shape.type,
      props: {
        ...shape.props,
        w: newWidth,
        h: newHeight,
      },
    };
  };

  component(shape: AIComponentShape) {
    const { w, h, componentCode } = shape.props;

    const ref = useRef<HTMLDivElement>(null);

    const [dimensions, setDimensions] = useState({ width: w, height: h });

    const handleDimensionsChange = (newDimensions: {
      width: number;
      height: number;
    }) => {
      setDimensions(newDimensions);
    };

    const editor = useEditor();
    useEffect(() => {
      editor.updateShapes([
        {
          id: shape.id,
          type: 'ai-component',
          props: {
            w: dimensions.width,
            h: dimensions.height,
          },
        },
      ]);
    }, [dimensions, editor, shape.id]);

    const containerStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    };

    const contentStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transform: `scale(${Math.min(
        w / dimensions.width,
        h / dimensions.height
      )})`,
      transformOrigin: 'center',
    };

    return (
      <HTMLContainer
        style={{
          height: h,
          width: w,
          pointerEvents: 'all',
          backgroundColor: '#efefef',
          overflow: 'hidden',
        }}
      >
        <div style={containerStyle}>
          <div style={contentStyle}>
            <ExampleCard
              ref={ref}
              onDimensionsChange={handleDimensionsChange}
            />
          </div>
        </div>
      </HTMLContainer>
    );
  }

  indicator(shape: AIComponentShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
