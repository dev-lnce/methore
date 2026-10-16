import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Send, 
  StopCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Activity, 
  Radio, 
  Layers, 
  FileSpreadsheet,
  Search,
  Filter,
  Check,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAudioAlert } from '../context/AudioAlertContext';
import { api } from '../services/api';

export default function EvaluationLabPage() {
  const { user } = useAuth();
  const { triggerAck } = useAudioAlert();

  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [metrics, setMetrics] = useState({
    total_sent: 50,
    total_delivered: 48,
    total_lost: 2,
    mdr_percent: 96.0,
    avg_delay_seconds: 3.8,
    min_delay_seconds: 1.2,
    max_delay_seconds: 11.4,
    hop_breakdown: {
      '1_hop': { hop_count: 1, sent: 18, delivered: 18, lost: 0, mdr_percent: 100.0, avg_delay_seconds: 2.1 },
      '2_hop': { hop_count: 2, sent: 22, delivered: 21, lost: 1, mdr_percent: 95.5, avg_delay_seconds: 3.8 },
      '3_hop': { hop_count: 3, sent: 10, delivered: 9, lost: 1, mdr_percent: 90.0, avg_delay_seconds: 7.2 }
    }
  });
  const [packetLogs, setPacketLogs] = useState([]);

  const [selectedHop, setSelectedHop] = useState(3);
  const [newScenarioName, setNewScenarioName] = useState('Scenario B: 3-Hop Heavy Foliage & Rain');
  const [isStarting, setIsStarting] = useState(false);
  const [isInjecting, setIsInjecting] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Table filters
  const [logSearch, setLogSearch] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('all');
  const [hopFilter, setHopFilter] = useState('all');

  // Fetch test sessions
  const fetchSessions = async (preferredSessionId = null) => {
    try {
      const data = await api.evaluation.getSessions();
      const list = data.sessions || [];
      setSessions(list);

      let targetSession = null;
      if (preferredSessionId) {
        targetSession = list.find(s => s.id === preferredSessionId);
      }
      if (!targetSession) {
        targetSession = list.find(s => s.is_active === 1) || list[0];
      }

      setActiveSession(targetSession || null);

      if (targetSession) {
        await loadMetrics(targetSession.id);
      }
    } catch (err) {
      console.error('Error fetching evaluation sessions:', err);
    }
  };

  // Fetch metrics and test packet logs for selected session
  const loadMetrics = async (sessionId) => {
    if (!sessionId) return;
    try {
      const data = await api.evaluation.getMetrics(sessionId);
      if (data.metrics) {
        setMetrics(data.metrics);
      }
      if (data.packets) {
        setPacketLogs(data.packets);
      }
    } catch (err) {
      console.error('Error fetching metrics:', err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleSelectSession = async (session) => {
    setActiveSession(session);
    await loadMetrics(session.id);
  };

  // Start new test session
  const handleStartSession = async (e) => {
    e.preventDefault();
    if (!newScenarioName.trim()) return;
    setIsStarting(true);
    setFeedback('');

    try {
      triggerAck();
      const result = await api.evaluation.createSession({
        session_name: newScenarioName.trim(),
        created_by: user?.full_name || 'Sam Taylor'
      });

      setFeedback('New test session initiated. Live incident pipeline isolated.');
      await fetchSessions(result.session?.id);
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
      await api.evaluation.stopSession(activeSession.id);
      setFeedback('Test session concluded and archived.');
      await fetchSessions(activeSession.id);
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
      // Realistic simulation: 90% chance delivered, 10% lost
      const isDelivered = Math.random() > 0.1;
      const delay = Number((1.2 + selectedHop * 1.4 + Math.random() * 0.8).toFixed(1));
      const now = new Date().toISOString();

      await api.evaluation.recordPacket({
        session_id: activeSession.id,
        send_time: now,
        receive_time: isDelivered ? new Date(Date.now() + delay * 1000).toISOString() : null,
        delay_seconds: isDelivered ? delay : null,
        hop_count: selectedHop,
        rssi: isDelivered ? -70 - (selectedHop * 8) : null,
        snr: isDelivered ? Number((9 - selectedHop * 1.5).toFixed(1)) : null,
        outcome: isDelivered ? 'Delivered' : 'Lost'
      });

      await loadMetrics(activeSession.id);
      setFeedback(`Packet recorded: ${isDelivered ? `Delivered in ${delay}s via ${selectedHop} hop(s)` : 'Packet lost (timeout)'}`);
    } catch (err) {
      console.error('Error recording packet:', err);
    } finally {
      setIsInjecting(false);
    }
  };

  // Filtered packet logs
  const filteredLogs = packetLogs.filter((pkt) => {
    const matchesSearch = 
      logSearch === '' ||
      pkt.packet_id.toLowerCase().includes(logSearch.toLowerCase()) ||
      pkt.outcome.toLowerCase().includes(logSearch.toLowerCase());

    const matchesOutcome = 
      outcomeFilter === 'all' || pkt.outcome.toLowerCase() === outcomeFilter.toLowerCase();

    const matchesHop = 
      hopFilter === 'all' || String(pkt.hop_count) === String(hopFilter);

    return matchesSearch && matchesOutcome && matchesHop;
  });

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
      {/* 1. Header Row with CSV Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Evaluation & Mesh Test Lab
          </h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
            <FlaskConical className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Test Traffic Isolated from Live Incidents</span>
          </span>
        </div>

        {activeSession && (
          <a
            href={api.evaluation.getExportCsvUrl(activeSession.id)}
            download={`evaluation_session_${activeSession.id}.csv`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Session Logs & Metrics (CSV)</span>
          </a>
        )}
      </div>

      {/* Session Switcher Pills */}
      {sessions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1">
            Test Scenarios:
          </span>
          {sessions.map((s) => {
            const isSelected = activeSession?.id === s.id;
            return (
              <button
                key={s.id}
                onClick={() => handleSelectSession(s)}
                type="button"
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${s.is_active === 1 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span>{s.session_name}</span>
                {s.is_active === 1 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isSelected ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  }`}>
                    Active
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {feedback && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/70 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* 2. Bento Grid: Test Session Controller (5 Cols) + Metrics Summary (7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Dark Hero Card: Session Controller (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 dark:bg-slate-900/90 text-white rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-card border border-slate-800 dark:border-slate-700/80 min-h-[290px]">
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-400 font-mono text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {activeSession?.is_active === 1 ? 'Session Active • Test Channel 09' : 'Session Concluded'}
              </span>
              <span className="font-mono text-xs text-slate-300 bg-white/10 px-2 py-0.5 rounded-lg">
                915.0 MHz
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
                Researcher: {activeSession?.created_by || 'Sam Taylor'}
              </p>
            </div>

            {/* Target Hop Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-300 font-medium">Injection Target Hop Count</span>
                <span className="font-mono text-xs font-semibold text-emerald-400">
                  Target: {selectedHop} Hop{selectedHop > 1 ? 's' : ''}
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

        {/* Right White/Dark Card: Research Evaluation Metrics (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card flex flex-col justify-between">
          <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Research Evaluation Metrics
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live aggregate delivery statistics across current session
              </p>
            </div>
            <span className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/70">
              PRD Target: &gt;90% MDR
            </span>
          </div>

          {/* 4 Metric Columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col">
              <span className="text-xs text-slate-500 dark:text-slate-400">Delivery Rate (MDR)</span>
              <span className="font-mono text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {metrics.mdr_percent?.toFixed(1) ?? '0.0'}%
              </span>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                {metrics.total_delivered} / {metrics.total_sent} delivered
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col">
              <span className="text-xs text-slate-500 dark:text-slate-400">Average Delay</span>
              <span className="font-mono text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {metrics.avg_delay_seconds}s
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Target &le;10s</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col">
              <span className="text-xs text-slate-500 dark:text-slate-400">Min / Max Delay</span>
              <span className="font-mono text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                {metrics.min_delay_seconds}s / {metrics.max_delay_seconds}s
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Worst case &lt;30s</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col">
              <span className="text-xs text-slate-500 dark:text-slate-400">Total Packets</span>
              <span className="font-mono text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {metrics.total_sent}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{metrics.total_lost} lost</span>
            </div>
          </div>

          {/* Per-Hop Reliability Breakdown Cards */}
          <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
            <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2.5">
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
                  <div key={h} className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {h} Hop{h > 1 ? 's' : ''} {h === 1 ? '(Direct RF)' : ''}
                      </span>
                      <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {hopData.mdr_percent.toFixed(1)}% MDR
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-2">
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
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
          <FlaskConical className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" />
          <input
            type="text"
            value={newScenarioName}
            onChange={(e) => setNewScenarioName(e.target.value)}
            placeholder="Enter new test scenario name..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-900 dark:focus:border-slate-500 outline-none transition-all shadow-sm"
          />
        </div>

        <button
          onClick={handleStartSession}
          disabled={isStarting}
          type="button"
          className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 transition-all shadow-sm whitespace-nowrap"
        >
          {isStarting ? 'Starting...' : 'Start New Test Session'}
        </button>
      </div>

      {/* 4. Populated Per-Packet Test Log Table (50 Packets) */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Per-Packet Test Transmission Log
              </h3>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                {packetLogs.length} Packets Recorded
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Individual broadcast telemetry records with RF link metrics and end-to-end delay
            </p>
          </div>

          {/* Filter / Search pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search packet ID..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-900 dark:focus:border-slate-500 w-36 sm:w-44"
              />
            </div>

            {/* Outcome Filter */}
            <select
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all">All Outcomes</option>
              <option value="Delivered">Delivered</option>
              <option value="Lost">Lost</option>
            </select>

            {/* Hop Filter */}
            <select
              value={hopFilter}
              onChange={(e) => setHopFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all">All Hops</option>
              <option value="1">1 Hop</option>
              <option value="2">2 Hops</option>
              <option value="3">3 Hops</option>
            </select>
          </div>
        </div>

        {/* Scrollable Table */}
        <div className="overflow-x-auto max-h-[460px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/90 dark:bg-slate-800/60 sticky top-0 z-10 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3 text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Packet ID
                </th>
                <th className="px-5 py-3 text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Outcome
                </th>
                <th className="px-5 py-3 text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Hop Count
                </th>
                <th className="px-5 py-3 text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Delay (s)
                </th>
                <th className="px-5 py-3 text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Signal (RSSI / SNR)
                </th>
                <th className="px-5 py-3 text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Send Time
                </th>
                <th className="px-5 py-3 text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Receive Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400 dark:text-slate-500">
                    No packets match current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((pkt) => {
                  const isDelivered = pkt.outcome === 'Delivered';
                  return (
                    <tr
                      key={pkt.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-5 py-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                        {pkt.packet_id}
                      </td>
                      <td className="px-5 py-3">
                        {isDelivered ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/70">
                            <Check className="w-3 h-3" />
                            <span>Delivered</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/70">
                            <XCircle className="w-3 h-3" />
                            <span>Lost</span>
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 font-mono text-slate-700 dark:text-slate-300">
                        <span className="font-semibold">{pkt.hop_count}</span> {pkt.hop_count === 1 ? 'Hop (Direct)' : 'Hops (Relayed)'}
                      </td>
                      <td className="px-5 py-3 font-mono">
                        {isDelivered ? (
                          <span className={`font-semibold ${pkt.delay_seconds > 8 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-slate-100'}`}>
                            {pkt.delay_seconds}s
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-600">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 font-mono text-slate-600 dark:text-slate-400">
                        {isDelivered && pkt.rssi ? (
                          <span>
                            <span className="text-slate-900 dark:text-slate-200">{pkt.rssi} dBm</span>
                            <span className="text-slate-400 dark:text-slate-600 mx-1">/</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">+{pkt.snr} dB</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-600">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                        {pkt.send_time ? pkt.send_time.replace('T', ' ').slice(11, 19) : '—'}
                      </td>
                      <td className="px-5 py-3 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                        {pkt.receive_time ? pkt.receive_time.replace('T', ' ').slice(11, 21) : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Displaying <strong className="text-slate-900 dark:text-slate-100">{filteredLogs.length}</strong> of {packetLogs.length} test records
          </span>
          <span className="font-mono text-[11px]">
            Overall: {metrics.total_delivered} Delivered • {metrics.total_lost} Lost • {metrics.mdr_percent?.toFixed(1)}% MDR
          </span>
        </div>
      </div>
    </div>
  );
}
