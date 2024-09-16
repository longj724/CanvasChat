// External Dependencies
import React from 'react';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

// Relative Dependencies
import MessageMarkdownMemoized from './MessageMarkdownMemoized';
import { MessageCodeBlock } from './MessageCodeBlock';

type Props = {
  content: string;
};

const MessageMarkdown = ({ content }: Props) => {
  return (
    <MessageMarkdownMemoized
      className="prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 mt-2 min-w-full space-y-6 break-words"
      remarkPlugins={[remarkGfm, remarkMath]}
      components={{
        // @ts-ignore
        p({ children }) {
          return <p className="mb-2 last:mb-0">{children}</p>;
        },
        // @ts-ignore
        img({ node, ...props }) {
          return (
            <img className="max-w-[67%]" {...props} alt="Chat Response Image" />
          );
        },
        // @ts-ignore
        code({ node, className, children, ...props }) {
          const childArray = React.Children.toArray(children);
          const firstChild = childArray[0] as React.ReactElement;
          const firstChildAsString = React.isValidElement(firstChild)
            ? (firstChild as React.ReactElement).props.children
            : firstChild;

          if (firstChildAsString === '▍') {
            return <span className="mt-1 animate-pulse cursor-default">▍</span>;
          }

          if (typeof firstChildAsString === 'string') {
            childArray[0] = firstChildAsString.replace('`▍`', '▍');
          }

          const match = /language-(\w+)/.exec(className || '');

          if (
            typeof firstChildAsString === 'string' &&
            !firstChildAsString.includes('\n')
          ) {
            return (
              <code className={className} {...props}>
                {childArray}
              </code>
            );
          }

          return (
            <MessageCodeBlock
              key={Math.random()}
              language={match?.[1] || ''}
              value={String(childArray).replace(/\n$/, '')}
              {...props}
            />
          );
        },
      }}
    >
      {content}
    </MessageMarkdownMemoized>
  );
};

export default MessageMarkdown;
