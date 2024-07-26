// External Dependencies
import React from 'react';
import { Handle, Position, HandleProps } from '@xyflow/react';

interface CustomPlusHandleProps extends HandleProps {
  size?: number;
  color?: string;
}

const CustomPlusHandle: React.FC<CustomPlusHandleProps> = ({
  size = 20,
  color = '#784be8',
  ...props
}) => {
  return (
    <Handle
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
      }}
      {...props}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', right: -size / 2, top: -size / 2 }}
      >
        <circle cx="12" cy="12" r="10" fill={color} />
        <path
          d="M12 7V17M7 12H17"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Handle>
  );
};

export default CustomPlusHandle;
