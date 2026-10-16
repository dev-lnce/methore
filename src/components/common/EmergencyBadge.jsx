import React from 'react';
import { HeartPulse, Flame, ShieldAlert, Car, Waves, AlertCircle } from 'lucide-react';

const EMERGENCY_CONFIG = {
  medical: {
    label: 'Medical',
    icon: HeartPulse,
    bg: 'bg-red-50 text-red-700 border-red-200',
    iconClass: 'text-red-600',
    dot: 'bg-red-600'
  },
  fire: {
    label: 'Fire',
    icon: Flame,
    bg: 'bg-orange-50 text-orange-700 border-orange-200',
    iconClass: 'text-orange-600',
    dot: 'bg-orange-600'
  },
  crime: {
    label: 'Crime',
    icon: ShieldAlert,
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    iconClass: 'text-purple-600',
    dot: 'bg-purple-600'
  },
  traffic_accident: {
    label: 'Traffic Accident',
    icon: Car,
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
    iconClass: 'text-amber-700',
    dot: 'bg-amber-600'
  },
  traffic: {
    label: 'Traffic Accident',
    icon: Car,
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
    iconClass: 'text-amber-700',
    dot: 'bg-amber-600'
  },
  disaster: {
    label: 'Disaster',
    icon: Waves,
    bg: 'bg-teal-50 text-teal-700 border-teal-200',
    iconClass: 'text-teal-600',
    dot: 'bg-teal-600'
  }
};

export default function EmergencyBadge({ type, size = 'sm', className = '' }) {
  const normalizedKey = (type || '').toLowerCase();
  const config = EMERGENCY_CONFIG[normalizedKey] || {
    label: type || 'Emergency',
    icon: AlertCircle,
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    iconClass: 'text-slate-600',
    dot: 'bg-slate-600'
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
