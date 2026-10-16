import React from 'react';
import { AlertCircle, Clock, Navigation, CheckCircle2, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
  New: {
    label: 'New',
    icon: AlertCircle,
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
    dotClass: 'bg-red-600 animate-pulse',
    isUrgent: true
  },
  Acknowledged: {
    label: 'Acknowledged',
    icon: Clock,
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    dotClass: 'bg-amber-500'
  },
  Responding: {
    label: 'Responding',
    icon: Navigation,
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
    dotClass: 'bg-blue-600'
  },
  Resolved: {
    label: 'Resolved',
    icon: CheckCircle2,
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dotClass: 'bg-emerald-600'
  },
  'False alarm': {
    label: 'False Alarm',
    icon: XCircle,
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    dotClass: 'bg-slate-400'
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
