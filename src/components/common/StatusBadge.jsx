import React from 'react';
import { AlertCircle, Clock, Navigation, CheckCircle2, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
  New: {
    label: 'New',
    icon: AlertCircle,
    badgeClass: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800/70',
    dotClass: 'bg-red-600 dark:bg-red-400 animate-pulse',
    isUrgent: true
  },
  Acknowledged: {
    label: 'Acknowledged',
    icon: Clock,
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/70',
    dotClass: 'bg-amber-500 dark:bg-amber-400'
  },
  Responding: {
    label: 'Responding',
    icon: Navigation,
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/70',
    dotClass: 'bg-blue-600 dark:bg-blue-400'
  },
  Resolved: {
    label: 'Resolved',
    icon: CheckCircle2,
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/70',
    dotClass: 'bg-emerald-600 dark:bg-emerald-400'
  },
  'False alarm': {
    label: 'False Alarm',
    icon: XCircle,
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    dotClass: 'bg-slate-400 dark:bg-slate-500'
  }
};

export default function StatusBadge({ status, size = 'sm', className = '' }) {
  // Normalize casing
  let key = status;
  if (status) {
    const lower = status.toLowerCase();
    if (lower === 'new') key = 'New';
    else if (lower === 'acknowledged') key = 'Acknowledged';
    else if (lower === 'responding') key = 'Responding';
    else if (lower === 'resolved') key = 'Resolved';
    else if (lower.includes('false')) key = 'False alarm';
  }

  const config = STATUS_CONFIG[key] || {
    label: status || 'Unknown',
    icon: AlertCircle,
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    dotClass: 'bg-slate-400'
  };

  const isLarge = size === 'lg';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border transition-all ${config.badgeClass} ${
        isLarge ? 'px-3.5 py-1.5 text-sm' : 'px-2.5 py-0.5 text-xs'
      } ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotClass}`} />
      <span>{config.label}</span>
    </span>
  );
}
