import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Send, 
  StopCircle, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Activity, 
  Radio, 
  Layers, 
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAudioAlert } from '../context/AudioAlertContext';

export default function EvaluationLabPage() {
  const { user } = useAuth();
  const { triggerAck } = useAudioAlert();

  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [metrics, setMetrics] = useState({
    total_sent: 0,
    total_delivered: 0,
    total_lost: 0,
    mdr_percent: 0,
    avg_delay_seconds: 0,
    min_delay_seconds: 0,
    max_delay_seconds: 0,
    hop_breakdown: {}
  });

  const [selectedHop, setSelectedHop] = useState(3);
  const [newScenarioName, setNewScenarioName] = useState('Scenario B: 3-Hop Foliage Test');
  const [isStarting, setIsStarting] = useState(false);
  const [isInjecting, setIsInjecting] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Fetch test sessions
  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/evaluation/sessions');
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
        const currentActive = data.sessions.find(s => s.is_active === 1) || data.sessions[0];
        setActiveSession(currentActive || null);

        if (currentActive) {
          fetchMetrics(currentActive.id);
        }
      }
    } catch (err) {
      console.error('Error fetching evaluation sessions:', err);
    }
  };

  // Fetch metrics for selected session
  const fetchMetrics = async (sessionId) => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/evaluation/sessions/${sessionId}/metrics`);
      if (res.ok) {
        const data = await res.json();
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Error fetching metrics:', err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Start new test session
  const handleStartSession = async (e) => {
    e.preventDefault();
    if (!newScenarioName.trim()) return;
    setIsStarting(true);
    setFeedback('');

    try {
      triggerAck();
      const res = await fetch('/api/evaluation/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_name: newScenarioName.trim(),
          created_by: user?.full_name || 'Sam Taylor'
        })
      });

      if (res.ok) {
        setFeedback('New test session initiated. Live incidents isolated.');
        await fetchSessions();
      }
    } catch (err) {
      console.error('Error starting session:', err);
    } finally {
      setIsStarting(false);
    }
  };

  // Stop active session
  const handleStopSession = async () => {
    if (!activeSession) return;
    try {
      triggerAck();
      const res = await fetch(`/api/evaluation/sessions/${activeSession.id}/stop`, {
        method: 'PATCH'
      });
      if (res.ok) {
        setFeedback('Test session concluded.');
        await fetchSessions();
      }
    } catch (err) {
      console.error('Error stopping session:', err);
    }
  };

  // Inject a simulated test packet into test_logs
  const handleInjectTestPacket = async () => {
    if (!activeSession) return;
    setIsInjecting(true);
    setFeedback('');

    try {
      triggerAck();
      // 90% chance delivered, 10% lost for realistic simulation
      const isDelivered = Math.random() > 0.1;
      const delay = Number((1.2 + selectedHop * 1.4 + Math.random() * 0.8).toFixed(2));
      const now = new Date().toISOString();

      await fetch('/api/evaluation/packets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: activeSession.id,
          send_time: now,
          receive_time: isDelivered ? new Date(Date.now() + delay * 1000).toISOString() : null,
          delay_seconds: isDelivered ? delay : null,
          hop_count: selectedHop,
          rssi: isDelivered ? -70 - (selectedHop * 8) : null,
          snr: isDelivered ? Number((9 - selectedHop * 1.5).toFixed(1)) : null,
          outcome: isDelivered ? 'Delivered' : 'Lost'
        })
      });

      await fetchMetrics(activeSession.id);
      setFeedback(`Packet logged: ${isDelivered ? `Delivered in ${delay}s (${selectedHop} hops)` : 'Lost'}`);
    } catch (err) {
      console.error('Error recording packet:', err);
    } finally {
      setIsInjecting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
      {/* 1. Header Row with CSV Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Evaluation & Mesh Test Lab
          </h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
            <FlaskConical className="w-3.5 h-3.5 text-emerald-600" />
            <span>Test Traffic Isolated from Live Incidents</span>
          </span>
        </div>

        {activeSession && (
          <a
            href={`/api/evaluation/sessions/${activeSession.id}/export/csv`}
            download={`evaluation_session_${activeSession.id}.csv`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Session Logs & Metrics (CSV)</span>
          </a>
        )}
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* 2. Bento Grid: Test Session Controller (5 Cols) + Metrics Summary (7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Dark Hero Card: Session Controller (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-card border border-slate-800 min-h-[280px]">
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-400 font-mono text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {activeSession?.is_active === 1 ? 'Session Active • Test Mode Isolated' : 'Session Concluded'}
              </span>
              <span className="font-mono text-xs text-slate-300 bg-white/10 px-2 py-0.5 rounded-lg">
                TEST-CH09
              </span>
            </div>

            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                Active Test Scenario
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight leading-snug">
                {activeSession?.session_name || 'Select or start a scenario'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Author: {activeSession?.created_by || 'Sam Taylor (Researcher)'}
              </p>
            </div>

            {/* Target Hop Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-300 font-medium">Simulation Target Hop Count</span>
                <span className="font-mono text-xs font-semibold text-emerald-400">
                  Target: {selectedHop} Hops
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1 p-1 bg-white/10 rounded-2xl">
                {[1, 2, 3, 4].map((hop) => {
                  const isActive = selectedHop === hop;
                  return (
                    <button
                      key={hop}
                      type="button"
                      onClick={() => setSelectedHop(hop)}
                      className={`py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {hop} Hop{hop > 1 ? 's' : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="relative z-10 pt-4 mt-4 border-t border-white/10 flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleInjectTestPacket}
              disabled={isInjecting || activeSession?.is_active !== 1}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white text-slate-900 text-xs font-semibold hover:bg-slate-100 disabled:opacity-40 transition-all shadow-sm active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isInjecting ? 'Broadcasting...' : 'Record Test Packet'}</span>
            </button>

            {activeSession?.is_active === 1 && (
              <button
                onClick={handleStopSession}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-semibold transition-colors"
              >
                <StopCircle className="w-3.5 h-3.5" />
                <span>Stop Session</span>
              </button>
            )}
          </div>
        </div>

        {/* Right White Card: Research Evaluation Metrics (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-card flex flex-col justify-between">
          <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Research Evaluation Metrics</h2>
              <p className="text-xs text-slate-500">Live aggregate delivery statistics across current session</p>
            </div>
            <span className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              PRD Target: &gt;90% MDR
            </span>
          </div>

          {/* 4 Metric Columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col">
              <span className="text-xs text-slate-500">Delivery Rate (MDR)</span>
              <span className="font-mono text-2xl font-bold text-slate-900 mt-1">
                {metrics.mdr_percent.toFixed(1)}%
              </span>
              <span className="text-[11px] font-mono text-emerald-600 font-semibold mt-0.5">
                {metrics.total_delivered} / {metrics.total_sent} delivered
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col">
              <span className="text-xs text-slate-500">Average Delay</span>
              <span className="font-mono text-2xl font-bold text-slate-900 mt-1">
                {metrics.avg_delay_seconds}s
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">Target ≤10s</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col">
              <span className="text-xs text-slate-500">Min / Max Delay</span>
              <span className="font-mono text-lg font-bold text-slate-900 mt-1">
                {metrics.min_delay_seconds}s / {metrics.max_delay_seconds}s
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">Worst case &lt;30s</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col">
              <span className="text-xs text-slate-500">Total Broadcasts</span>
              <span className="font-mono text-2xl font-bold text-slate-900 mt-1">
                {metrics.total_sent}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">{metrics.total_lost} lost</span>
            </div>
          </div>

          {/* Per-Hop Reliability Breakdown Cards */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <span className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
              Hop-by-Hop Reliability Breakdown
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[1, 2, 3].map((h) => {
                const hopData = metrics.hop_breakdown?.[`${h}_hop`] || {
                  sent: 0,
                  delivered: 0,
                  mdr_percent: 0,
                  avg_delay_seconds: 0
                };
                return (
                  <div key={h} className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        {h} Hop{h > 1 ? 's' : ''} {h === 1 ? '(Direct RF)' : ''}
                      </span>
                      <span className="font-mono text-xs font-bold text-emerald-600">
                        {hopData.mdr_percent.toFixed(0)}% MDR
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mt-2">
                      <span>{hopData.delivered} / {hopData.sent} pkts</span>
                      <span>Avg: {hopData.avg_delay_seconds}s</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. New Scenario Trigger Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
          <FlaskConical className="w-5 h-5 text-slate-500 shrink-0" />
          <input
            type="text"
            value={newScenarioName}
            onChange={(e) => setNewScenarioName(e.target.value)}
            placeholder="Enter new test scenario name..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all shadow-sm"
          />
        </div>

        <button
          onClick={handleStartSession}
          disabled={isStarting}
          type="button"
          className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 transition-all shadow-sm whitespace-nowrap"
        >
          {isStarting ? 'Starting...' : 'Start New Test Session'}
        </button>
      </div>
    </div>
  );
}
