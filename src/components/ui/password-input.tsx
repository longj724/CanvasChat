import * as React from 'react';

import { Input } from '@/components/ui/input';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <Input
        className={className}
        {...props}
        suffix={
          showPassword ? (
            <EyeIcon
              className="select-none"
              onClick={() => setShowPassword(false)}
            />
          ) : (
            <EyeOffIcon
              className="select-none"
              onClick={() => setShowPassword(true)}
            />
          )
        }
        type={showPassword ? 'text' : 'password'}
        ref={ref}
      />
    );
  }
);

PasswordInput.displayName = 'Input';

export { PasswordInput };
