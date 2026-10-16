import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Radio, 
  Volume2, 
  VolumeX, 
  Search, 
  CheckCircle, 
  Router, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import EmergencyBadge from '../components/common/EmergencyBadge';
import StatusBadge from '../components/common/StatusBadge';
import GpsBadge from '../components/common/GpsBadge';
import { useAudioAlert } from '../context/AudioAlertContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function LiveIncidentsPage() {
  const { isMuted, toggleAudio, triggerAlert, triggerAck } = useAudioAlert();
  const { user } = useAuth();

  const [incidents, setIncidents] = useState([]);
  const [counts, setCounts] = useState({
    all: 0,
    new: 0,
    acknowledged: 0,
    responding: 0,
    resolved: 0,
    false_alarm: 0,
    unread: 0,
    flagged: 0
  });

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  // Fetch incidents via dual-mode API
  const fetchIncidents = useCallback(async (isPolling = false) => {
    try {
      const data = await api.incidents.getAll({
        search,
        status: selectedStatus,
        emergency_type: selectedType,
        sort: sortOrder
      });

      if (data && data.status === 'success') {
        if (isPolling && data.counts && counts.new !== undefined && data.counts.new > counts.new) {
          triggerAlert();
        }
        setIncidents(data.incidents || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err) {
      console.warn('Could not fetch live incidents:', err);
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedStatus, selectedType, sortOrder, counts.new, triggerAlert]);

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(() => fetchIncidents(true), 4000);
    const handleReset = () => fetchIncidents();
    window.addEventListener('methore_data_reset', handleReset);
    return () => {
      clearInterval(interval);
      window.removeEventListener('methore_data_reset', handleReset);
    };
  }, [fetchIncidents]);

  // Acknowledge latest new incident
  const handleAcknowledgeLatest = async () => {
    const latestNew = incidents.find(i => i.status === 'New');
    if (!latestNew) return;

    try {
      triggerAck();
      await api.incidents.updateStatus(latestNew.id, {
        status: 'Acknowledged',
        changed_by_name: user?.full_name || 'Alex Rivera',
        changed_by_role: user?.role || 'official',
        note: 'Quick station acknowledgment from Live Incident Board'
      });
      fetchIncidents();
    } catch (err) {
      console.error('Error acknowledging latest:', err);
    }
  };

  // Inline quick status change
  const handleInlineStatusChange = async (incidentId, newStatus) => {
    try {
      triggerAck();
      await api.incidents.updateStatus(incidentId, {
        status: newStatus,
        changed_by_name: user?.full_name || 'Alex Rivera',
        changed_by_role: user?.role || 'official',
        note: `Status updated to ${newStatus} via inline quick selector`
      });
      fetchIncidents();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Simulate an incoming mesh packet on demand
  const handleSimulatePacket = async () => {
    setIsSimulating(true);
    triggerAlert();

    const sampleTypes = ['medical', 'fire', 'crime', 'traffic_accident', 'disaster'];
    const randomType = sampleTypes[Math.floor(Math.random() * sampleTypes.length)];
    const areas = ['Purok 2 Plaza', 'Purok 3 Market', 'Purok 4 School Tower', 'Purok 5 Riverside', 'Purok 1 North Sector'];
    const randomArea = areas[Math.floor(Math.random() * areas.length)];

    const residentList = [
      { user_id: 'RES-1012', device_id: 'HND-042', lat: 13.9412, lon: 121.1624 },
      { user_id: 'RES-1009', device_id: 'HND-009', lat: 13.9435, lon: 121.1650 },
      { user_id: 'RES-1010', device_id: 'HND-010', lat: 13.9420, lon: 121.1605 },
      { user_id: 'RES-1011', device_id: 'HND-011', lat: 13.9465, lon: 121.1670 }
    ];
    const chosen = residentList[Math.floor(Math.random() * residentList.length)];

    try {
      const now = new Date().toISOString();
      await api.packets.ingest({
        user_id: chosen.user_id,
        device_id: chosen.device_id,
        emergency_type: randomType,
        latitude: chosen.lat + (Math.random() - 0.5) * 0.002,
        longitude: chosen.lon + (Math.random() - 0.5) * 0.002,
        area_name: randomArea,
        gps_status: 'valid',
        report_time: now,
        hop_count: Math.floor(1 + Math.random() * 3),
        rssi: -68 - Math.floor(Math.random() * 15),
        snr: Number((5 + Math.random() * 6).toFixed(1)),
        notes: 'Simulated radio report received from Handheld device'
      });

      await fetchIncidents();
    } catch (err) {
      console.error('Error simulating packet:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-150">
      {/* 1. Header & Quick Action Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Live Incidents
          </h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-xs font-semibold border border-slate-200 dark:border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            LoRa Stream
          </span>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto flex-wrap">
          {/* Audio Alert Toggle */}
          <button
            onClick={toggleAudio}
            type="button"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-xs font-semibold"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-slate-400" />
                <span>Audio Alert: Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Audio Alert: On</span>
              </>
            )}
          </button>

          {/* Simulate Packet Button */}
          <button
            onClick={handleSimulatePacket}
            disabled={isSimulating}
            type="button"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 dark:bg-slate-800 text-white shadow-sm hover:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 transition-all text-xs font-semibold disabled:opacity-50 border border-transparent dark:border-slate-700"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>+ Simulate Mesh Packet</span>
          </button>
        </div>
      </div>

      {/* 2. Top Bento-Grid Hierarchy: Primary Hero Bento + 4 Clean Status Counters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Primary Hero Card (Dark Slate, 5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 dark:bg-slate-900/90 text-white rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-card border border-slate-800 dark:border-slate-700/80 min-h-[200px]">
          {/* Glow backdrop circle */}
          <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

          {/* Top connection strip */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-xs font-medium text-slate-200">
                USB Serial Connected (COM4)
              </span>
            </div>
            <span className="font-mono text-xs text-slate-300">
              Station Gateway: STN-01
            </span>
          </div>

          {/* Middle unread SOS queue counter */}
          <div className="relative z-10 my-3">
            <span className="font-mono text-xs text-slate-400 uppercase tracking-wider block mb-1">
              Live Incoming SOS Queue
            </span>
            <div className="text-3xl font-extrabold text-white flex items-center gap-3">
              <span>{counts.new} Unacknowledged</span>
              {counts.new > 0 && (
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
              )}
            </div>
          </div>

          {/* Bottom action row */}
          <div className="relative z-10 flex items-center justify-between gap-3 pt-3 border-t border-white/10">
            <button
              onClick={handleAcknowledgeLatest}
              disabled={counts.new === 0}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white text-slate-900 font-semibold text-xs shadow-sm hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
            >
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Acknowledge Latest</span>
            </button>
            <span className="font-mono text-xs text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              915 MHz Active
            </span>
          </div>
        </div>

        {/* Right Status Card (7 Cols, Clean 4 Status Counters, Zero Fake Telemetry Clutter) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Incident Status Breakdown
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Total Recorded: {counts.all}
            </span>
          </div>

          {/* 4 Clean Status Counters (New, Acknowledged, Responding, Resolved) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-auto">
            {/* New */}
            <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">New</span>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">{counts.new}</span>
              </div>
            </div>

            {/* Acknowledged */}
            <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Acknowledged</span>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{counts.acknowledged}</span>
              </div>
            </div>

            {/* Responding */}
            <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Responding</span>
                <span className="w-2 h-2 rounded-full bg-blue-500" />
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{counts.responding}</span>
              </div>
            </div>

            {/* Resolved */}
            <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Resolved</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{counts.resolved}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Unified Incident Table Container */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden flex flex-col">
        {/* Search & Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search resident, ID (e.g. RES-1012), area..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-900 dark:focus:border-slate-400 outline-none transition-all shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              {[
                { key: 'all', label: `All (${counts.all})` },
                { key: 'new', label: `New (${counts.new})` },
                { key: 'acknowledged', label: `Acknowledged (${counts.acknowledged})` },
                { key: 'responding', label: `Responding (${counts.responding})` },
                { key: 'resolved', label: `Resolved (${counts.resolved})` }
              ].map((s) => {
                const active = selectedStatus === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setSelectedStatus(s.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      active
                        ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-sm border border-transparent dark:border-slate-700'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>

            {/* Type Filter & Sort Controls */}
            <div className="flex items-center gap-2 self-end lg:self-auto">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer focus:bg-white dark:focus:bg-slate-900 focus:border-slate-900 dark:focus:border-slate-400"
              >
                <option value="all">All Types</option>
                <option value="medical">Medical</option>
                <option value="fire">Fire</option>
                <option value="crime">Crime</option>
                <option value="traffic">Traffic Accident</option>
                <option value="disaster">Disaster</option>
              </select>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer focus:bg-white dark:focus:bg-slate-900 focus:border-slate-900 dark:focus:border-slate-400"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="status">By Status</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm divide-y divide-slate-100 dark:divide-slate-800/70">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Report Time</th>
                <th className="py-3 px-4">Emergency</th>
                <th className="py-3 px-4">Resident & Device</th>
                <th className="py-3 px-4">Location & GPS</th>
                <th className="py-3 px-4">Mesh Path</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 bg-white dark:bg-[#111827]">
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 dark:text-slate-500">
                    {isLoading ? 'Loading live mesh incidents...' : 'No incident reports matching your criteria.'}
                  </td>
                </tr>
              ) : (
                incidents.map((inc) => {
                  const isNew = inc.status === 'New';
                  const isFlagged = inc.is_registered_flag === 0;

                  return (
                    <tr
                      key={inc.id}
                      className={`transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${
                        isNew ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''
                      }`}
                    >
                      {/* Report Time */}
                      <td className="py-3.5 px-4 font-mono text-xs whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {isNew && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
                          <span className={isNew ? 'font-bold text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300 font-medium'}>
                            {inc.receipt_time ? inc.receipt_time.slice(11, 19) : '--:--:--'}
                          </span>
                        </div>
                      </td>

                      {/* Emergency Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <EmergencyBadge type={inc.emergency_type} />
                      </td>

                      {/* Resident & ID */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {inc.resident_name || (isFlagged ? 'Unknown Resident' : 'Registered Citizen')}
                            </span>
                            {isFlagged && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/70 text-[10px] font-bold">
                                Flagged Unlinked
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                            {inc.user_id} • {inc.device_id}
                          </span>
                        </div>
                      </td>

                      {/* GPS & Area */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-slate-800 dark:text-slate-200 text-xs">
                            {inc.area_name}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <GpsBadge status={inc.gps_status} />
                          </div>
                        </div>
                      </td>

                      {/* Mesh Hops & Signal */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Router className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-slate-800 dark:text-slate-200">{inc.hop_count} {inc.hop_count === 1 ? 'hop' : 'hops'}</span>
                          <span className="text-slate-400 dark:text-slate-500 font-normal">({inc.rssi} dBm)</span>
                        </div>
                      </td>

                      {/* Status + Quick Inline Switcher */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={inc.status} />
                          <select
                            value={inc.status}
                            onChange={(e) => handleInlineStatusChange(inc.id, e.target.value)}
                            className="text-[11px] font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 outline-none text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500 cursor-pointer"
                          >
                            <option value="New">New</option>
                            <option value="Acknowledged">Acknowledged</option>
                            <option value="Responding">Responding</option>
                            <option value="Resolved">Resolved</option>
                            <option value="False alarm">False alarm</option>
                          </select>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <Link
                          to={`/incidents/${inc.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-900 hover:text-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all border border-slate-200/60 dark:border-slate-700"
                        >
                          <span>Open Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
