import React from 'react';
import { Navigation2, AlertTriangle, MapPinOff } from 'lucide-react';

export default function GpsBadge({ status, className = '' }) {
  const norm = (status || 'valid').toLowerCase();

  if (norm === 'valid') {
    return (
      <span className={`inline-flex items-center gap-1 font-mono text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/70 px-2 py-0.5 rounded-full ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Live GPS</span>
      </span>
    );
  }

  if (norm === 'stale') {
    return (
      <span className={`inline-flex items-center gap-1 font-mono text-[11px] font-medium text-amber-800 bg-amber-50 border border-dashed border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/70 px-2 py-0.5 rounded-full ${className}`}>
        <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
        <span>Stale GPS</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 font-mono text-[11px] font-medium text-rose-700 bg-rose-50 border border-dashed border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/70 px-2 py-0.5 rounded-full ${className}`}>
      <MapPinOff className="w-3 h-3 text-rose-600 dark:text-rose-400" />
      <span>No GPS Fix</span>
    </span>
  );
}
