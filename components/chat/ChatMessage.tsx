'use client'
import React from 'react';
import { User, Cpu } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '@/lib/types';
import ToolCallCard from './ToolCallCard';

interface ChatMessageProps {
  key?: any;
  message: ChatMessageType;
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
        className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm shadow-xs leading-relaxed border transition-colors ${
          isUser 
            ? 'bg-zinc-905 dark:bg-zinc-50 border-zinc-900 dark:border-zinc-200 text-white dark:text-zinc-950 font-medium'
            : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200/60 dark:border-zinc-850 text-zinc-800 dark:text-zinc-205'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>

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
