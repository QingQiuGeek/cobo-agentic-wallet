'use client'
import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true); // default to dark for Web3 styling

  useEffect(() => {
    // Sync the initial theme
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <button
      id="theme-toggle-btn"
      onClick={() => setIsDark(!isDark)}
      className="p-1 px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors focus:outline-none flex items-center gap-1.5 text-xs font-mono font-medium"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <>
          <Sun className="h-3.5 w-3.5 text-amber-500 animate-[pulse_3s_infinite]" />
          <span>Light</span>
        </>
      ) : (
        <>
          <Moon className="h-3.5 w-3.5 text-blue-500" />
          <span>Dark</span>
        </>
      )}
    </button>
  );
}
