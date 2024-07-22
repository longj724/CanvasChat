import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { forwardRef, useEffect } from 'react';

interface ExampleCardProps {
  onDimensionsChange?: (newDimensions: {
    width: number;
    height: number;
  }) => void;
}

const ExampleCard = forwardRef<HTMLDivElement, ExampleCardProps>(
  ({ onDimensionsChange }: ExampleCardProps, ref) => {
    // useEffect(() => {
    //   const handleResize = () => {
    //     if (ref && 'current' in ref) {
    //       //  @ts-ignore
    //       const { offsetWidth, offsetHeight } = ref.current;
    //       onDimensionsChange({ width: offsetWidth, height: offsetHeight });
    //     }
    //   };

    //   handleResize();
    //   window.addEventListener('resize', handleResize);

    //   return () => {
    //     window.removeEventListener('resize', handleResize);
    //   };
    // }, [ref]);

    return (
      <Card className="w-full">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Enter your email and password to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
          </div>
          <div className="flex items-center justify-between">
            <Link
              href="#"
              className="text-sm font-medium text-primary-foreground hover:underline"
              prefetch={false}
            >
              Forgot Password?
            </Link>
            <Button type="submit" className="ml-auto">
              Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
);

export default ExampleCard;
