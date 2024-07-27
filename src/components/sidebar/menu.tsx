'use client';

// External Dependencies
import { Ellipsis, LogOut, CircleUserRound } from 'lucide-react';
import { SignInButton, SignUpButton } from '@clerk/nextjs';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';

interface MenuProps {
  isOpen: boolean | undefined;
}

export function Menu({ isOpen }: MenuProps) {
  return (
    <ScrollArea className="[&>div>div[style]]:!block">
      <nav className="h-full w-full">
        <ul
          className={cn(
            isOpen && 'px-2',
            'flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-2'
          )}
        >
          {isOpen ? (
            <li className="gap-2">
              <div className="mt-2">
                <SignUpButton mode="modal">
                  <Button>Sign up</Button>
                </SignUpButton>
              </div>

              <div className="mt-2">
                <SignInButton mode="modal">
                  <Button>Sign in</Button>
                </SignInButton>
              </div>
            </li>
          ) : (
            <li>
              <Button size={'icon'}>
                <CircleUserRound className="w-6 h-4" />
              </Button>
            </li>
          )}

          {/* <li className="w-full grow flex items-end">
            <TooltipProvider disableHoverableContent>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => {}}
                    variant="outline"
                    className={cn('w-full justify-center h-10 mt-5')}
                  >
                    <span className={cn(isOpen === false ? '' : 'mr-4')}>
                      <LogOut size={18} />
                    </span>
                    <p
                      className={cn(
                        'whitespace-nowrap',
                        isOpen === false ? 'opacity-0 hidden' : 'opacity-100'
                      )}
                    >
                      Sign out
                    </p>
                  </Button>
                </TooltipTrigger>
                {isOpen === false && (
                  <TooltipContent side="right">Sign out</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </li> */}
        </ul>
      </nav>
    </ScrollArea>
  );
}
