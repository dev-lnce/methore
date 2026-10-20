import { HeartPulse, Flame, ShieldAlert, Car, Waves } from 'lucide-react';

// One entry per physical incident key. `key` matches the simulator's category
// keys (and EmergencyBadge); `lcdLabel` is the long form shown on the LCD.
// Face colours for crime/disaster follow EmergencyBadge (purple / teal), not
// the original mockup — the handset and dashboard must agree.
export const INCIDENT_KEYS = [
  { key: 'medical', label: 'MEDICAL', lcdLabel: 'MEDICAL EMERGENCY', icon: HeartPulse, face: '#C62839', shadow: '#7C1220', ink: '#FFFFFF' },
  { key: 'fire', label: 'FIRE', lcdLabel: 'FIRE', icon: Flame, face: '#F57C00', shadow: '#9A4D00', ink: '#1A1208' },
  { key: 'crime', label: 'CRIME', lcdLabel: 'CRIME', icon: ShieldAlert, face: '#6B3FA5', shadow: '#38206A', ink: '#FFFFFF' },
  { key: 'traffic', label: 'TRAFFIC', lcdLabel: 'TRAFFIC ACCIDENT', icon: Car, face: '#F5C518', shadow: '#9A7D00', ink: '#1A1708' },
  { key: 'disaster', label: 'DISASTER', lcdLabel: 'DISASTER', icon: Waves, face: '#0F766E', shadow: '#08443F', ink: '#FFFFFF', subLabel: 'FLOOD · QUAKE · TYPHOON' }
];

export const CANCEL_KEY = { face: '#55616D', shadow: '#2D353D', ink: '#FFFFFF' };
export const SEND_KEY = { face: '#17743F', shadow: '#0B3F21', ink: '#FFFFFF' };

export const HOLD_TO_SEND_MS = 2000;

export const GPS_LABELS = { valid: 'OK', stale: 'STALE', unavailable: 'NO FIX' };

export function getIncidentKey(key) {
  return INCIDENT_KEYS.find((k) => k.key === key) || INCIDENT_KEYS[0];
}
