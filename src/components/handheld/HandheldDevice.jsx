import React from 'react';
import HandheldLcd, { lcdAnnouncement } from './HandheldLcd';
import { INCIDENT_KEYS, CANCEL_KEY, SEND_KEY, GPS_LABELS, getIncidentKey } from './deviceConfig';

export const DEVICE_WIDTH = 400;
export const DEVICE_HEIGHT = 760;
export const ANTENNA_HEIGHT = 48;

const keyVars = (k) => ({ '--key-face': k.face, '--key-shadow': k.shadow, '--key-ink': k.ink });

function StatusLed({ label, color }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="rounded-full"
        style={{ width: 10, height: 10, background: color, boxShadow: `0 0 8px ${color}` }}
      />
      <span className="font-device font-semibold text-[14px] tracking-[0.2em]" style={{ color: '#B4BEC9' }}>
        {label}
      </span>
    </div>
  );
}

/**
 * Presentational handset. No API calls — the page owns all behaviour and feeds
 * it `screen` ('idle' | 'confirm' | 'sending' | 'to_mesh' | 'delivered' | 'failed').
 */
export default function HandheldDevice({
  screen,
  userId,
  gpsState,
  selectedType,
  holdProgress,
  isHolding,
  receivedTime,
  onPick,
  onCancel,
  onHoldStart,
  onHoldEnd
}) {
  const busy = screen === 'sending' || screen === 'to_mesh';
  const canSend = screen === 'confirm';
  const type = getIncidentKey(selectedType);
  const failed = screen === 'failed';

  const gpsColor = gpsState === 'valid' ? '#3DDC84' : gpsState === 'stale' ? '#F5C518' : '#E5484D';
  const meshColor = failed ? '#F5C518' : '#3DDC84';

  const handleHoldKeyDown = (e) => {
    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
      e.preventDefault();
      onHoldStart();
    }
  };
  const handleHoldKeyUp = (e) => {
    if (e.key === ' ' || e.key === 'Enter') onHoldEnd();
  };

  return (
    <div className="relative select-none" style={{ width: DEVICE_WIDTH, paddingTop: ANTENNA_HEIGHT }}>
      {/* 915 MHz antenna: fixed, not removable */}
      <div className="absolute" style={{ top: 0, right: 64 }} aria-hidden="true">
        <div
          style={{
            width: 20,
            height: ANTENNA_HEIGHT + 6,
            borderRadius: '10px 10px 0 0',
            background: '#1A2129',
            boxShadow: 'inset 0 0 0 3px #2D3945'
          }}
        />
        <div
          style={{ position: 'absolute', left: -8, bottom: -2, width: 36, height: 14, borderRadius: 4, background: '#3A4856' }}
        />
      </div>

      <div
        className="relative flex flex-col justify-between"
        style={{
          width: DEVICE_WIDTH,
          height: DEVICE_HEIGHT,
          padding: 28,
          borderRadius: 56,
          background: '#26303A',
          boxShadow: 'inset 0 0 0 4px #34414E, 0 34px 60px rgba(20,30,40,0.28)'
        }}
      >
        {/* Status strip */}
        <div className="flex items-center justify-between px-1" aria-hidden="true">
          <StatusLed label="GPS" color={gpsColor} />
          <StatusLed label="MESH" color={meshColor} />
          <StatusLed label="BATT" color="#3DDC84" />
        </div>

        {/* Display bezel + LCD */}
        <div
          style={{ padding: 12, borderRadius: 18, background: '#0B0F13', boxShadow: 'inset 0 0 0 2px #1E2831' }}
        >
          <HandheldLcd
            screen={screen}
            userId={userId}
            gpsState={gpsState}
            selectedType={selectedType}
            receivedTime={receivedTime}
          />
          <div className="sr-only" role="status" aria-live="polite">
            {`${userId}. GPS ${GPS_LABELS[gpsState] || 'OK'}. ${lcdAnnouncement({
              screen,
              typeLabel: type.lcdLabel,
              receivedTime
            })}`}
          </div>
        </div>

        {/* Five incident keys */}
        <div className="grid grid-cols-2" style={{ gap: 14 }}>
          {INCIDENT_KEYS.map((k) => {
            const Icon = k.icon;
            const isWide = k.key === 'disaster';
            const isSelected = (screen !== 'idle') && selectedType === k.key;
            return (
              <button
                key={k.key}
                type="button"
                className="hh-key flex flex-col items-center justify-center gap-1"
                style={{ ...keyVars(k), height: 88, borderRadius: 22, gridColumn: isWide ? '1 / span 2' : undefined }}
                aria-label={isWide ? 'Disaster: flood, earthquake or typhoon' : `${k.lcdLabel.charAt(0)}${k.lcdLabel.slice(1).toLowerCase()}`}
                aria-pressed={isSelected}
                disabled={busy}
                onClick={() => onPick(k.key)}
              >
                <Icon size={isWide ? 26 : 30} strokeWidth={2.5} aria-hidden="true" />
                <span className="font-device font-bold text-[26px] leading-none tracking-[0.08em]">{k.label}</span>
                {k.subLabel && (
                  <span className="font-device font-semibold text-[13px] leading-none tracking-[0.18em] opacity-90">
                    {k.subLabel}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* CANCEL + hold-to-SEND */}
        <div className="grid grid-cols-2" style={{ gap: 14 }}>
          <button
            type="button"
            className="hh-key font-device font-bold text-[26px] tracking-[0.1em]"
            style={{ ...keyVars(CANCEL_KEY), height: 82, borderRadius: 41 }}
            aria-label="Cancel"
            disabled={busy || screen === 'idle'}
            onClick={onCancel}
          >
            CANCEL
          </button>

          <button
            type="button"
            className="hh-key relative flex flex-col items-center justify-center"
            style={{ ...keyVars(SEND_KEY), height: 82, borderRadius: 41, touchAction: 'none' }}
            aria-label="Send report (press and hold for 2 seconds)"
            disabled={!canSend}
            onPointerDown={(e) => {
              if (e.button === 0 || e.pointerType === 'touch') onHoldStart();
            }}
            onPointerUp={onHoldEnd}
            onPointerLeave={onHoldEnd}
            onPointerCancel={onHoldEnd}
            onKeyDown={handleHoldKeyDown}
            onKeyUp={handleHoldKeyUp}
            onBlur={onHoldEnd}
            onContextMenu={(e) => e.preventDefault()}
          >
            <span className="absolute inset-0 overflow-hidden" style={{ borderRadius: 'inherit' }} aria-hidden="true">
              <span
                className="absolute left-0 top-0 bottom-0"
                style={{ width: `${holdProgress}%`, background: 'rgba(255,255,255,0.28)' }}
              />
            </span>
            <span className="relative font-device font-bold text-[28px] leading-none tracking-[0.1em]">
              {isHolding ? 'HOLD…' : 'SEND'}
            </span>
            <span className="relative font-device font-semibold text-[13px] leading-none tracking-[0.18em] mt-1 opacity-90">
              HOLD 2 SEC
            </span>
          </button>
        </div>

        <div
          className="text-center font-device font-semibold text-[14px] tracking-[0.35em]"
          style={{ color: '#8D99A6' }}
          aria-hidden="true"
        >
          EMERGENCY HANDSET
        </div>
      </div>
    </div>
  );
}
