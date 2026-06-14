'use client'
import { useState, useRef, useEffect } from 'react';
import { ArrowRight, Zap, Square } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onStop?: () => void;
  disabled?: boolean;
}

const SUGGESTIONS = [
  '查询钱包余额',
  '调用 ETH 链上分析（0.0001 ETH）',
  '查询最近交易记录',
];

export default function ChatInput({ onSendMessage, onStop, disabled = false }: ChatInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSendMessage(text.trim());
    setText('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (disabled) return;
    onSendMessage(suggestion);
  };

  return (
    <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3.5 flex flex-col gap-2">
      {/* Suggestions */}
      <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none items-center">
        <span className="text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500 flex items-center gap-1 shrink-0 mr-1">
          <Zap className="h-2.5 w-2.5 text-amber-500 animate-pulse" />
          <span>快捷指令:</span>
        </span>
        {SUGGESTIONS.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleSuggestionClick(suggestion)}
            className="shrink-0 text-[10px] font-mono px-2 py-1 rounded bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors focus:outline-none cursor-pointer"
            disabled={disabled}
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className="flex gap-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Agent 处理中...' : '输入指令... (Enter 发送, Shift+Enter 换行)'}
          rows={1}
          className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-zinc-800 dark:focus:border-zinc-300 focus:bg-white dark:focus:bg-zinc-950 transition-all font-mono resize-none overflow-hidden"
          disabled={disabled}
          autoComplete="off"
        />
        {disabled ? (
          <button
            onClick={onStop}
            className="p-2.5 rounded-md bg-red-500 hover:bg-red-600 text-white transition-all focus:outline-none flex items-center justify-center cursor-pointer"
            title="停止"
          >
            <Square className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="bg-zinc-900 dark:bg-zinc-100 p-2.5 rounded-md text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all focus:outline-none flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="发送 (Enter)"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
