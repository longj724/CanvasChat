'use client';

// External Dependencies
import { Dispatch, SetStateAction, useState } from 'react';
import { CircleUserRound, Key, PanelsTopLeft } from 'lucide-react';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs';

// Relative Dependencies
import Space from './space';
import { Button } from '@/components/ui/button';
import CreateSpaceModal from '../modals/create-space-modal';
import { WithTooltip } from '../ui/with-tooltip';
import { useGetSpaces } from '@/hooks/use-get-spaces';
import ApiKeyModal from '../modals/api-key-modal';

interface MenuProps {
  isOpen: boolean | undefined;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export function Menu({ isOpen, setIsOpen }: MenuProps) {
  const { data } = useGetSpaces();

  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);

  return (
    <nav className="flex flex-col h-full w-full">
      <ApiKeyModal open={apiKeyModalOpen} setOpen={setApiKeyModalOpen} />
      <div className="flex flex-row h-14 items-center justify-center border-b  w-full gap-1">
        <PanelsTopLeft className="h-6 w-6" />
        {isOpen && <span className="">FlowChat</span>}
      </div>
      <SignedIn>
        {isOpen ? (
          <>
            <div className="flex flex-row items-center">
              <h1 className="mt-3 ml-3 font-bold mb-2">Spaces</h1>
              <div className="ml-auto mr-2 mt-3">
                <WithTooltip
                  delayDuration={100}
                  display={<p>New Space</p>}
                  trigger={<CreateSpaceModal />}
                />
              </div>
            </div>
            <div className="flex flex-col w-full gap-2 justify-center items-center">
              {data?.spaces.map((space) => (
                <Space key={space.id} space={space} />
              ))}
            </div>
          </>
        ) : (
          <div className="w-full flex flex-row items-center justify-center mt-3">
            <WithTooltip
              delayDuration={100}
              display={<p>New Space</p>}
              trigger={<CreateSpaceModal />}
            />
          </div>
        )}
      </SignedIn>

      <SignedIn>
        <div className="flex flex-1 items-center justify-center">
          <div className="justify-self-end self-end mb-2 flex flex-col justify-center items-center gap-3">
            {isOpen ? (
              <Button onClick={() => setApiKeyModalOpen((prev) => !prev)}>
                API Keys <Key size={16} className="ml-2" />
              </Button>
            ) : (
              <Button
                size={'icon'}
                onClick={() => setApiKeyModalOpen((prev) => !prev)}
              >
                <Key size={16} />
              </Button>
            )}
            <UserButton showName={isOpen} />
          </div>
        </div>
      </SignedIn>

      <SignedOut>
        <div className="flex flex-1 items-center justify-center">
          {isOpen ? (
            <div className="flex flex-col flex-1 items-center justify-center justify-self-end self-end mb-2">
              <div className="mt-2 w-full flex items-center justify-center">
                <SignInButton mode="modal">
                  <Button className="w-4/5" variant={'outline'}>
                    Sign in
                  </Button>
                </SignInButton>
              </div>

              <div className="mt-2 w-full flex items-center justify-center">
                <SignUpButton mode="modal">
                  <Button className="w-4/5">Sign up</Button>
                </SignUpButton>
              </div>
            </div>
          ) : (
            <CircleUserRound
              className="h-8 w-8 justify-self-end self-end mb-2 hover:cursor-pointer"
              onClick={() => setIsOpen((prev) => !prev)}
            />
          )}
        </div>
      </SignedOut>
    </nav>
  );
}
