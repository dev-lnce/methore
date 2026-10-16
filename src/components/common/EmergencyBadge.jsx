import React from 'react';
import { HeartPulse, Flame, ShieldAlert, Car, Waves, AlertCircle } from 'lucide-react';

const EMERGENCY_CONFIG = {
  medical: {
    label: 'Medical',
    icon: HeartPulse,
    bg: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800/70',
    iconClass: 'text-red-600 dark:text-red-400',
    dot: 'bg-red-600 dark:bg-red-400'
  },
  fire: {
    label: 'Fire',
    icon: Flame,
    bg: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800/70',
    iconClass: 'text-orange-600 dark:text-orange-400',
    dot: 'bg-orange-600 dark:bg-orange-400'
  },
  crime: {
    label: 'Crime',
    icon: ShieldAlert,
    bg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/70',
    iconClass: 'text-purple-600 dark:text-purple-400',
    dot: 'bg-purple-600 dark:bg-purple-400'
  },
  traffic_accident: {
    label: 'Traffic Accident',
    icon: Car,
    bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/70',
    iconClass: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-600 dark:bg-amber-400'
  },
  traffic: {
    label: 'Traffic Accident',
    icon: Car,
    bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/70',
    iconClass: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-600 dark:bg-amber-400'
  },
  disaster: {
    label: 'Disaster',
    icon: Waves,
    bg: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800/70',
    iconClass: 'text-teal-600 dark:text-teal-400',
    dot: 'bg-teal-600 dark:bg-teal-400'
  }
};

export default function EmergencyBadge({ type, size = 'sm', className = '' }) {
  const normalizedKey = (type || '').toLowerCase();
  const config = EMERGENCY_CONFIG[normalizedKey] || {
    label: type || 'Emergency',
    icon: AlertCircle,
    bg: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    iconClass: 'text-slate-600 dark:text-slate-400',
    dot: 'bg-slate-600 dark:bg-slate-400'
  };

  const IconComponent = config.icon;
  const isLarge = size === 'lg';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border transition-all ${config.bg} ${
        isLarge ? 'px-3.5 py-1.5 text-sm' : 'px-2.5 py-0.5 text-xs'
      } ${className}`}
    >
      <IconComponent className={isLarge ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
}
