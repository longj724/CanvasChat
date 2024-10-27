'use client';

// External Dependencies
import { type Dispatch, type SetStateAction } from 'react';
import { Check, Copy, LoaderCircle } from 'lucide-react';
import { useStoreApi } from '@xyflow/react';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';

// Relative Dependencies
import MessageMarkdown from './MessageMarkdown';
import { cn } from '@/lib/utils';
import { WithTooltip } from '@/components/ui/with-tooltip';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';

type Props = {
  content: string;
  isLoading?: boolean;
  model: string;
  togglePanning: Dispatch<SetStateAction<boolean>>;
  type: 'user' | 'system' | 'assistant';
};

const MessageText = ({
  content,
  isLoading,
  model,
  togglePanning,
  type,
}: Props) => {
  const store = useStoreApi();
  const { user } = useUser();
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex w-full flex-row items-center justify-center py-3 bg-muted'
        )}
      >
        <LoaderCircle className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  const onCopy = () => {
    if (isCopied) return;
    copyToClipboard(content);
  };

  const getModelLogo = () => {
    if (
      model === 'gpt-4-0125-preview' ||
      model === 'gpt-4-turbo' ||
      model === 'gpt-4o' ||
      model === 'gpt-4o-mini'
    ) {
      return 'https://utfs.io/f/011ccb66-ae35-4419-b2fd-51ef9175f637-mj83aa.png';
    } else if (model === 'llama-3.1-8b-instant') {
      return 'https://utfs.io/f/5d86278f-f1a9-470f-8613-fe8dc1d102a0-q2n0kg.jpeg';
    } else if (
      model === 'claude-3-5-sonnet-latest' ||
      model === 'claude-3-opus-latest' ||
      model === 'claude-3-haiku-20240307'
    ) {
      return 'https://mwbkkujllezvgvvudxer.supabase.co/storage/v1/object/public/general/anthropic-logo.png';
    } else {
      // Logo for local ollama models
      return 'https://mwbkkujllezvgvvudxer.supabase.co/storage/v1/object/public/general/ollama-logo.png';
    }
  };

  // TODO: Get this working
  const onEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    store.setState({
      nodesDraggable: false,
    });
    togglePanning((prev) => !prev);
  };

  const onLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    store.setState({
      nodesDraggable: true,
    });
    togglePanning((prev) => !prev);
  };

  return (
    <div
      className={cn(
        'flex w-full flex-row items-center justify-center py-3',
        type === 'user' ? 'bg-muted/40' : 'bg-muted'
      )}
      // onMouseEnter={onEnter}
      // onMouseLeave={onLeave}
    >
      <div className="flex w-11/12 flex-col ">
        <div className="flex flex-row items-center gap-2 py-2">
          <img
            src={type === 'user' ? user?.imageUrl ?? '' : getModelLogo()}
            width={30}
            height={30}
            alt="Model Logo"
            className="rounded-full"
          />
          <h2 className="font-semibold text-[24px]">
            {type === 'user' ? 'You' : model}
          </h2>
          <div className="ml-auto flex flex-row">
            <WithTooltip
              delayDuration={200}
              display={<p>Copy</p>}
              side="top"
              trigger={
                isCopied ? (
                  <Check size={18} className="text-gray-500" />
                ) : (
                  <Copy
                    size={18}
                    onClick={onCopy}
                    className="hover:text-gray-500"
                  />
                )
              }
            />
          </div>
        </div>
        <MessageMarkdown content={content} />
      </div>
    </div>
  );
};

export default MessageText;
