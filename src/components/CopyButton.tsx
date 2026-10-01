'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CopyButton({ text, dark = false, label }: { text: string; dark?: boolean; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (label) {
    return (
      <button onClick={handleCopy} className="btn btn-primary flex items-center gap-2">
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            已复制
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            {label}
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      className={`p-2 rounded transition-colors ${dark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
      aria-label="复制"
    >
      {copied ? (
        <Check className={`w-4 h-4 ${dark ? 'text-green-400' : 'text-green-600'}`} />
      ) : (
        <Copy className={`w-4 h-4 ${dark ? 'text-gray-400' : 'text-gray-500'}`} />
      )}
    </button>
  );
}