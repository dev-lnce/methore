import React from 'react';
import { SlidersHorizontal, Zap, Info } from 'lucide-react';
import { GPS_LABELS } from './deviceConfig';

const GPS_OPTIONS = ['valid', 'stale', 'unavailable'];
const HOP_OPTIONS = [1, 2, 3];

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</span>
      {children}
    </div>
  );
}

function Segmented({ label, options, value, onChange, format }) {
  return (
    <div role="group" aria-label={label} className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt)}
            className={`px-2 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              active
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800'
            }`}
          >
            {format ? format(opt) : opt}
          </button>
        );
      })}
    </div>
  );
}

const LAST_OUTCOME = {
  delivered: { text: 'Delivered, ACK received', tone: 'text-emerald-700 dark:text-emerald-400' },
  ack_lost: { text: 'Reached the dashboard, ACK lost (NO REPLY YET)', tone: 'text-amber-700 dark:text-amber-400' },
  error: { text: 'Send failed (ingest threw)', tone: 'text-rose-700 dark:text-rose-400' }
};

export default function SimulatorControls({
  presets,
  preset,
  onPresetChange,
  gpsState,
  onGpsChange,
  hopCount,
  onHopChange,
  failNext,
  onFailNextChange,
  canInstantSend,
  onInstantSend,
  lastResult
}) {
  const outcome = lastResult ? LAST_OUTCOME[lastResult.outcome] : null;

  return (
    <aside
      aria-label="Simulator controls"
      className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-card p-5 flex flex-col gap-4"
    >
      <div>
        <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white">
          <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
          Simulator controls
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Presenter only. None of this exists on the real handset.
        </p>
      </div>

      <Field label="Resident">
        <select
          value={preset.user_id}
          onChange={(e) => onPresetChange(e.target.value)}
          className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100"
        >
          {presets.map((p) => (
            <option key={p.user_id} value={p.user_id}>
              {p.user_id} · {p.device_id} · {p.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="GPS state">
        <Segmented label="GPS state" options={GPS_OPTIONS} value={gpsState} onChange={onGpsChange} format={(o) => GPS_LABELS[o]} />
      </Field>

      <Field label="Mesh hops">
        <Segmented label="Mesh hops" options={HOP_OPTIONS} value={hopCount} onChange={onHopChange} format={(o) => `${o} ${o === 1 ? 'hop' : 'hops'}`} />
      </Field>

      <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
        <input
          type="checkbox"
          role="switch"
          checked={failNext}
          onChange={(e) => onFailNextChange(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-amber-600"
        />
        <span>
          <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">Lose the ACK on next send</span>
          <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            The report still reaches the dashboard, but the handset hears nothing back and shows NO REPLY YET. Resets after one send.
          </span>
        </span>
      </label>

      <button
        type="button"
        onClick={onInstantSend}
        disabled={!canInstantSend}
        className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Zap className="w-4 h-4" aria-hidden="true" />
        Instant send (skip the 2 s hold)
      </button>
      {!canInstantSend && (
        <p className="-mt-2 text-[11px] text-slate-500 dark:text-slate-400">Press an incident key on the handset first.</p>
      )}

      <div className="border-t border-slate-200 dark:border-slate-800 pt-3" aria-live="polite">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Last transmission</span>
        {lastResult ? (
          <dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
            <dt className="text-slate-500 dark:text-slate-400">Result</dt>
            <dd className={`font-semibold ${outcome?.tone || ''}`}>{outcome?.text}</dd>
            {lastResult.incident_code && (
              <>
                <dt className="text-slate-500 dark:text-slate-400">Incident</dt>
                <dd className="font-mono font-semibold text-slate-900 dark:text-slate-100">{lastResult.incident_code}</dd>
              </>
            )}
            {lastResult.ack_id && (
              <>
                <dt className="text-slate-500 dark:text-slate-400">ACK</dt>
                <dd className="font-mono text-slate-900 dark:text-slate-100">{lastResult.ack_id} via {lastResult.gateway}</dd>
              </>
            )}
            {lastResult.is_registered_flag === 0 && (
              <>
                <dt className="text-slate-500 dark:text-slate-400">Flag</dt>
                <dd className="font-semibold text-amber-700 dark:text-amber-400">Unregistered device</dd>
              </>
            )}
          </dl>
        ) : (
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">Nothing sent yet.</p>
        )}
      </div>

      <p className="flex gap-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
        Mock mode shares localStorage. Open Live Incidents in a second tab of this same browser profile; it re-reads every ~4 s, no refresh needed.
      </p>
    </aside>
  );
}
