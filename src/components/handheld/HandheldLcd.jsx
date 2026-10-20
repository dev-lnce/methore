import React from 'react';
import { GPS_LABELS, getIncidentKey } from './deviceConfig';

// 128x64 monochrome panel drawn at 2.5x (320x160). All text is ink on the pale
// background; all sizes below are written at that drawing scale.
const px = (n) => ({ fontSize: `${n}px` });

function LcdText({ size, className = '', children, style }) {
  return (
    <div className={`leading-[0.85] whitespace-nowrap ${className}`} style={{ ...px(size), ...style }}>
      {children}
    </div>
  );
}

function CheckMark() {
  return (
    <svg width="34" height="34" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <polyline
        points="6,17 13,24 26,9"
        stroke="#1B261A"
        strokeWidth="4"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

export function lcdAnnouncement({ screen, typeLabel, receivedTime }) {
  switch (screen) {
    case 'confirm':
      return `Report this? ${typeLabel}. Hold send to report, or cancel to go back.`;
    case 'sending':
    case 'to_mesh':
      return `${typeLabel}. Sending. Finding a path.`;
    case 'delivered':
      return `Received. Barangay station OK. ${typeLabel} at ${receivedTime}.`;
    case 'failed':
      return `${typeLabel}. No reply yet. Report saved. Device keeps trying.`;
    default:
      return 'Ready. Press an incident button. Works offline.';
  }
}

export default function HandheldLcd({ screen, userId, gpsState, selectedType, receivedTime }) {
  const type = getIncidentKey(selectedType);
  const failed = screen === 'failed';
  const hasLeftBar = screen === 'confirm' || screen === 'sending' || screen === 'to_mesh' || failed;

  return (
    <div
      className="hh-lcd relative overflow-hidden rounded-[6px] font-lcd"
      style={{ width: 320, height: 160 }}
      aria-hidden="true"
    >
      {/* Header bar, constant across states */}
      <div
        className="flex items-center justify-between px-2"
        style={{ height: 26, background: '#1B261A', color: '#BFCBAE', ...px(22) }}
      >
        <span className="leading-none whitespace-nowrap">ID {userId}</span>
        <span className="leading-none whitespace-nowrap">
          GPS {GPS_LABELS[gpsState] || 'OK'} MESH {failed ? 'WEAK' : 'OK'}
        </span>
      </div>

      {/* Left status bar: solid for confirm/sending, dashed for no-reply */}
      {hasLeftBar && (
        <div
          className={`absolute left-0 bottom-0 ${failed ? 'hh-lcd-bar-dashed' : ''}`}
          style={{ top: 26, width: 10, background: failed ? undefined : '#1B261A' }}
        />
      )}

      <div
        className="flex flex-col justify-center gap-[7px]"
        style={{ height: 134, paddingLeft: hasLeftBar ? 22 : 14, paddingRight: 10 }}
      >
        {screen === 'idle' && (
          <>
            <LcdText size={58}>READY</LcdText>
            <LcdText size={28}>Press an incident button</LcdText>
            <LcdText size={22}>Works offline</LcdText>
          </>
        )}

        {screen === 'confirm' && (
          <>
            <LcdText size={24} style={{ letterSpacing: 2 }}>REPORT THIS?</LcdText>
            <LcdText size={40}>{type.lcdLabel}</LcdText>
            <LcdText size={26}>Hold SEND to report</LcdText>
            <LcdText size={26}>CANCEL to go back</LcdText>
          </>
        )}

        {(screen === 'sending' || screen === 'to_mesh') && (
          <>
            <LcdText size={24}>{type.lcdLabel}</LcdText>
            <LcdText size={54}>SENDING</LcdText>
            <div style={{ height: 16, border: '2px solid #1B261A', padding: 2, width: 250 }}>
              <div className="hh-lcd-progress" style={{ height: 8 }} />
            </div>
            <LcdText size={24}>Finding a path...</LcdText>
          </>
        )}

        {screen === 'delivered' && (
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-full shrink-0"
              style={{ width: 60, height: 60, border: '4px solid #1B261A' }}
            >
              <CheckMark />
            </div>
            <div className="flex flex-col gap-[7px] min-w-0">
              <LcdText size={50}>RECEIVED</LcdText>
              <LcdText size={26}>Barangay station OK</LcdText>
              <LcdText size={22}>{type.lcdLabel} {receivedTime}</LcdText>
            </div>
          </div>
        )}

        {failed && (
          <>
            <LcdText size={24}>{type.lcdLabel}</LcdText>
            <LcdText size={46}>NO REPLY YET</LcdText>
            <LcdText size={26}>Report saved.</LcdText>
            <LcdText size={26}>Device keeps trying.</LcdText>
          </>
        )}
      </div>
    </div>
  );
}
