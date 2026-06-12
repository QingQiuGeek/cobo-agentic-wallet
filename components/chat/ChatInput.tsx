'use client'
import React, { useState } from 'react';
import { Send, ArrowRight, Zap } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

const SUGGESTIONS = [
  '查询钱包余额',
  '调用 ETH 链上分析（0.0001 ETH）',
  '查询最近交易记录',
];

export default function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSendMessage(text.trim());
    setText('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (disabled) return;
    onSendMessage(suggestion);
  };

  return (
    <div id="chat-composer" className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3.5 flex flex-col gap-2">
      {/* Suggestions shortcuts */}
      <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none items-center">
        <span className="text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500 flex items-center gap-1 shrink-0 mr-1">
          <Zap className="h-2.5 w-2.5 text-amber-500 animate-pulse" />
          <span>快捷指令:</span>
        </span>
        {SUGGESTIONS.map((suggestion, index) => (
          <button
            key={index}
            id={`suggestion-btn-${index}`}
            onClick={() => handleSuggestionClick(suggestion)}
            className="shrink-0 text-[10px] font-mono px-2 py-1 rounded bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-650 dark:text-zinc-350 hover:text-zinc-900 border border-zinc-150 dark:border-zinc-800 transition-colors focus:outline-none cursor-pointer"
            disabled={disabled}
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Primary entry row */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          id="chat-text-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={disabled ? 'Agent 处理中...' : '输入指令，如：查询余额、调用付费服务、转账...'}
          className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-zinc-800 dark:focus:border-zinc-350 focus:bg-white dark:focus:bg-zinc-950 transition-all font-mono"
          disabled={disabled}
          autoComplete="off"
        />
        <button
          id="chat-send-btn"
          type="submit"
          className="bg-zinc-900 dark:bg-zinc-100 p-2.5 rounded-md text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all focus:outline-none flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled || !text.trim()}
          title="Send instruction"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
