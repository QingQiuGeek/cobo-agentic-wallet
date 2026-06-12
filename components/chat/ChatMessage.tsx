'use client'
import React, { useState } from 'react';
import { User, Cpu, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage as ChatMessageType } from '@/lib/types';
import ToolCallCard from './ToolCallCard';

interface ChatMessageProps {
  message: ChatMessageType;
}

type MarkdownElementProps<T extends keyof React.JSX.IntrinsicElements> =
  React.ComponentPropsWithoutRef<T> & {
    children?: React.ReactNode;
    node?: unknown;
  };

const LONG_IDENTIFIER_PATTERN = /(0x[a-fA-F0-9]{20,}|[a-fA-F0-9]{64,})/g;
const EXACT_LONG_IDENTIFIER_PATTERN = /^(0x[a-fA-F0-9]{20,}|[a-fA-F0-9]{64,})$/;

function formatIdentifier(value: string) {
  if (value.length <= 24) return value;
  return `${value.slice(0, 10)}...${value.slice(-8)}`;
}

// Copyable tx/address component for inline rendering
function CopyableIdentifier({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <span
      className="inline-flex max-w-full items-center gap-1 rounded bg-zinc-200 px-1.5 py-0.5 align-middle font-mono text-[11px] text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100"
      title={value}
    >
      <span className="min-w-0 truncate whitespace-nowrap">{formatIdentifier(value)}</span>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy full value"
        title="Copy full value"
        className="shrink-0 cursor-pointer rounded p-0.5 transition-colors hover:bg-zinc-300 dark:hover:bg-zinc-600"
      >
        {copied ? (
          <Check className="h-3 w-3 text-emerald-500" />
        ) : (
          <Copy className="h-3 w-3 text-zinc-500" />
        )}
      </button>
    </span>
  );
}

function renderLongIdentifiers(children: React.ReactNode): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (typeof child === 'string') {
      const parts = child.split(LONG_IDENTIFIER_PATTERN);

      return parts.map((part, index) =>
        EXACT_LONG_IDENTIFIER_PATTERN.test(part) ? (
          <CopyableIdentifier key={`${part}-${index}`} value={part} />
        ) : (
          part
        ),
      );
    }

    if (React.isValidElement<{ children?: React.ReactNode }>(child)) {
      const childProps = child.props;

      if (!childProps.children) {
        return child;
      }

      return React.cloneElement(child, {
        ...childProps,
        children: renderLongIdentifiers(childProps.children),
      });
    }

    return child;
  });
}

function cleanMarkdownProps<T extends { node?: unknown }>(props: T) {
  const elementProps = { ...props };
  delete elementProps.node;
  return elementProps;
}

// Custom renderers for markdown content
const markdownComponents: Components = {
  p: ({ children, ...props }: MarkdownElementProps<'p'>) => {
    return <p {...cleanMarkdownProps(props)} className="my-1 leading-relaxed">{renderLongIdentifiers(children)}</p>;
  },
  ul: ({ children, ...props }: MarkdownElementProps<'ul'>) => {
    return <ul {...cleanMarkdownProps(props)} className="my-1 list-disc space-y-0.5 pl-5">{children}</ul>;
  },
  ol: ({ children, ...props }: MarkdownElementProps<'ol'>) => {
    return <ol {...cleanMarkdownProps(props)} className="my-1 list-decimal space-y-0.5 pl-5">{children}</ol>;
  },
  li: ({ children, ...props }: MarkdownElementProps<'li'>) => {
    return <li {...cleanMarkdownProps(props)} className="pl-0.5">{renderLongIdentifiers(children)}</li>;
  },
  table: ({ children, ...props }: MarkdownElementProps<'table'>) => {
    return (
      <div className="my-2 max-w-full overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-700">
        <table {...cleanMarkdownProps(props)} className="w-full min-w-max table-fixed border-collapse text-xs">
          {children}
        </table>
      </div>
    );
  },
  thead: ({ children, ...props }: MarkdownElementProps<'thead'>) => {
    return <thead {...cleanMarkdownProps(props)} className="bg-zinc-200 dark:bg-zinc-700">{children}</thead>;
  },
  th: ({ children, ...props }: MarkdownElementProps<'th'>) => {
    return (
      <th
        {...cleanMarkdownProps(props)}
        className="max-w-44 whitespace-nowrap px-2 py-1.5 text-left font-semibold text-zinc-800 dark:text-zinc-100"
      >
        {renderLongIdentifiers(children)}
      </th>
    );
  },
  td: ({ children, ...props }: MarkdownElementProps<'td'>) => {
    return (
      <td
        {...cleanMarkdownProps(props)}
        className="max-w-44 border-t border-zinc-200 px-2 py-1.5 align-top dark:border-zinc-700"
      >
        <div className="max-w-44 overflow-hidden text-ellipsis whitespace-nowrap">
          {renderLongIdentifiers(children)}
        </div>
      </td>
    );
  },
  code: ({ children, className, ...props }: MarkdownElementProps<'code'>) => {
    const value = String(children).trim();

    if (!className && EXACT_LONG_IDENTIFIER_PATTERN.test(value)) {
      return <CopyableIdentifier value={value} />;
    }

    return (
      <code
        {...cleanMarkdownProps(props)}
        className={`${className ?? ''} rounded bg-zinc-200 px-1 py-0.5 font-mono text-xs break-all dark:bg-zinc-700`}
      >
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }: MarkdownElementProps<'pre'>) => {
    return (
      <pre
        {...cleanMarkdownProps(props)}
        className="my-2 overflow-x-auto rounded-md bg-zinc-900 p-3 text-xs text-zinc-100 dark:bg-zinc-950"
      >
        {children}
      </pre>
    );
  },
  a: ({ children, ...props }: MarkdownElementProps<'a'>) => {
    return (
      <a
        {...cleanMarkdownProps(props)}
        className="break-all text-blue-600 underline underline-offset-2 dark:text-blue-400"
        title={typeof children === 'string' ? children : props.href}
      >
        {children}
      </a>
    );
  },
};

// Markdown renderer for agent messages
function MarkdownContent({ content }: { content: string }) {
	return (
		<div className="max-w-full text-sm text-zinc-900 dark:text-zinc-100 [&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-zinc-400 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-zinc-600 [&_blockquote]:dark:border-zinc-500 [&_blockquote]:dark:text-zinc-400 [&_h1]:my-2 [&_h1]:text-base [&_h1]:font-semibold [&_h2]:my-2 [&_h2]:text-sm [&_h2]:font-semibold [&_h3]:my-2 [&_h3]:text-sm [&_h3]:font-semibold [&_hr]:my-2 [&_hr]:border-zinc-300 [&_hr]:dark:border-zinc-600 [&_strong]:font-semibold">
			<div className="max-w-full overflow-hidden">
				<ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
					{content}
				</ReactMarkdown>
			</div>
		</div>
	);
}

export default function ChatMessage({ message }: ChatMessageProps) {
	const isUser = message.sender === 'user';

	return (
		<div
			id={`chat-message-${message.id}`}
			className={`flex flex-col mb-4.5 animate-in slide-in-from-bottom-2 fade-in duration-300 ${
				isUser ? 'items-end' : 'items-start'
			}`}
		>
			{/* Sender metadata row */}
			<div className="flex items-center gap-1.5 mb-1.5 px-1.5">
				{isUser ? (
					<>
						<span className="text-[10px] text-zinc-400 font-medium">{message.time}</span>
						<span className="text-[11px] font-semibold text-zinc-650 dark:text-zinc-350 flex items-center gap-1">
							<span>Owner</span>
							<User className="h-3 w-3" />
						</span>
					</>
				) : (
					<>
						<span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
							<Cpu className="h-3 w-3 text-emerald-500 animate-pulse" />
							<span>Cobo Agent</span>
						</span>
						<span className="text-[10px] text-zinc-400 font-medium">{message.time}</span>
					</>
				)}
			</div>

			{/* Message Bubble content */}
			<div
				className={`min-w-0 max-w-[85%] rounded-lg px-4 py-2.5 text-sm shadow-xs leading-relaxed border transition-colors ${
					isUser
						? 'bg-zinc-200 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 font-medium'
						: 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100'
				}`}
			>
				{isUser ? (
					<p className="whitespace-pre-wrap">{message.content}</p>
				) : (
					<MarkdownContent content={message.content} />
				)}

				{/* Embedded Tool execution lists */}
				{!isUser && message.toolCalls && message.toolCalls.length > 0 && (
					<div className="mt-2 text-zinc-800 dark:text-zinc-200">
						{message.toolCalls.map((call) => (
							<ToolCallCard key={call.id} {...call} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}
