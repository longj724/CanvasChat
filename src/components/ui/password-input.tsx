import * as React from 'react';

import { Input } from '@/components/ui/input';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  suffix?: React.ReactNode;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, type, suffix, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className="flex gap-2 items-center w-full">
        <Input
          className={className}
          {...props}
          type={showPassword ? 'text' : 'password'}
          ref={ref}
        />
        <div className="hover:cursor-pointer">
          {showPassword ? (
            <EyeIcon
              className="select-none"
              onClick={() => setShowPassword(false)}
            />
          ) : (
            <EyeOffIcon
              className="select-none"
              onClick={() => setShowPassword(true)}
            />
          )}
        </div>
      </div>
    );
  }
);

PasswordInput.displayName = 'Input';

export { PasswordInput };
