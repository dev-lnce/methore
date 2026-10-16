import React from 'react';
import { Navigation2, AlertTriangle, MapPinOff } from 'lucide-react';

export default function GpsBadge({ status, className = '' }) {
  const norm = (status || 'valid').toLowerCase();

  if (norm === 'valid') {
    return (
      <span className={`inline-flex items-center gap-1 font-mono text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>GPS Fix (Valid)</span>
      </span>
    );
  }

  if (norm === 'stale') {
    return (
      <span className={`inline-flex items-center gap-1 font-mono text-[11px] font-medium text-amber-800 bg-amber-50 border border-dashed border-amber-300 px-2 py-0.5 rounded-full ${className}`}>
        <AlertTriangle className="w-3 h-3 text-amber-600" />
        <span>Stale GPS</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 font-mono text-[11px] font-medium text-rose-700 bg-rose-50 border border-dashed border-rose-300 px-2 py-0.5 rounded-full ${className}`}>
      <MapPinOff className="w-3 h-3 text-rose-600" />
      <span>No GPS Lock</span>
    </span>
  );
}
