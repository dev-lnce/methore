import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Volume2,
  VolumeX,
  Search,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import EmergencyBadge from '../components/common/EmergencyBadge';
import StatusBadge from '../components/common/StatusBadge';
import GpsBadge from '../components/common/GpsBadge';
import { useAudioAlert } from '../context/AudioAlertContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatClock } from '../utils/time';

const STATUS_OPTIONS = ['New', 'Acknowledged', 'Responding', 'Resolved', 'False alarm'];

const selectClass =
  'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer focus:bg-white dark:focus:bg-slate-900 focus:border-slate-900 dark:focus:border-slate-400';

// One status control: the badge is the display, a transparent native select
// laid over it is the control, so there is a single thing to read and click.
function StatusControl({ incident, onChange }) {
  return (
    <div className="relative inline-flex items-center gap-1 rounded-full focus-within:ring-2 focus-within:ring-slate-400 dark:focus-within:ring-slate-500">
      <StatusBadge status={incident.status} />
      <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" aria-hidden="true" />
      <select
        value={incident.status}
        onChange={(e) => onChange(incident.id, e.target.value)}
        aria-label={`Status for ${incident.incident_code}`}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}

function ResidentCell({ incident }) {
  const isFlagged = incident.is_registered_flag === 0;
  return (
    <div className="flex flex-col min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {incident.resident_name || (isFlagged ? 'Unknown Resident' : 'Registered Citizen')}
        </span>
        {isFlagged && (
          <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/70 text-[10px] font-bold">
            Flagged Unlinked
          </span>
        )}
      </div>
      <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
        {incident.user_id} • {incident.device_id}
      </span>
    </div>
  );
}

// Area, then the mesh path in plain words; GPS only speaks up when it is not a good fix.
function LocationCell({ incident }) {
  const gps = (incident.gps_status || 'valid').toLowerCase();
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <span className="font-medium text-slate-800 dark:text-slate-200 text-xs">{incident.area_name}</span>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
          {incident.hop_count} {incident.hop_count === 1 ? 'hop' : 'hops'}
        </span>
        {gps !== 'valid' && <GpsBadge status={incident.gps_status} />}
      </div>
    </div>
  );
}

function OpenLink({ incident }) {
  return (
    <Link
      to={`/incidents/${incident.id}`}
      aria-label={`Open details for ${incident.incident_code}`}
      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-900 hover:text-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors border border-slate-200/60 dark:border-slate-700"
    >
      <span>Open</span>
      <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
    </Link>
  );
}

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
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  const isMock = api.isMockMode();
  const alertRef = useRef(triggerAlert);
  const prevNewRef = useRef(null);
  const requestRef = useRef(0);

  useEffect(() => {
    alertRef.current = triggerAlert;
  });

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch incidents via dual-mode API
  const fetchIncidents = useCallback(async (isPolling = false) => {
    const requestId = ++requestRef.current;
    try {
      const data = await api.incidents.getAll({
        search: debouncedSearch,
        status: selectedStatus,
        emergency_type: selectedType,
        sort: sortOrder
      });

      // A slower, older response must not overwrite a newer one
      if (requestId !== requestRef.current) return;

      if (data && data.status === 'success') {
        if (data.counts) {
          if (isPolling && prevNewRef.current !== null && data.counts.new > prevNewRef.current) {
            alertRef.current();
          }
          prevNewRef.current = data.counts.new;
          setCounts(data.counts);
        }
        setIncidents(data.incidents || []);
      }
    } catch (err) {
      console.warn('Could not fetch live incidents:', err);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, selectedStatus, selectedType, sortOrder]);

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

  // Acknowledge the newest unacknowledged report, whatever filter or sort is showing
  const handleAcknowledgeLatest = async () => {
    try {
      const pending = await api.incidents.getAll({ status: 'new', sort: 'newest' });
      const latestNew = pending?.incidents?.[0];
      if (!latestNew) return;

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

  const hasActiveFilters = search !== '' || selectedStatus !== 'all' || selectedType !== 'all';
  const clearFilters = () => {
    setSearch('');
    setSelectedStatus('all');
    setSelectedType('all');
  };

  return (
    <div className="flex flex-col gap-5 w-full animate-in fade-in duration-150">
      {/* 1. Header & Quick Action Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Live Incidents
          </h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-xs font-semibold border border-slate-200 dark:border-slate-700">
            <span className={`w-2 h-2 rounded-full ${isMock ? 'bg-slate-400' : 'bg-emerald-500 animate-pulse'}`} />
            {isMock ? 'Demo data' : 'LoRa Stream'}
          </span>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={toggleAudio}
            type="button"
            aria-pressed={!isMuted}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-semibold"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-slate-400" aria-hidden="true" />
                <span>Sound off</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                <span>Sound on</span>
              </>
            )}
          </button>

          <button
            onClick={handleSimulatePacket}
            disabled={isSimulating}
            type="button"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-semibold disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
            <span>Simulate packet</span>
          </button>
        </div>
      </div>

      {/* 2. The one thing that needs attention */}
      <section
        aria-label="Unacknowledged reports"
        className={`rounded-3xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-card ${
          counts.new > 0
            ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
            : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800'
        }`}
      >
        <div className="flex items-center gap-3" role="status">
          {counts.new > 0 ? (
            <span className="relative flex w-3 h-3 shrink-0" aria-hidden="true">
              <span className="absolute inline-flex w-full h-full rounded-full bg-rose-500 opacity-60 animate-ping" />
              <span className="relative inline-flex w-3 h-3 rounded-full bg-rose-600" />
            </span>
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
          )}
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {counts.new === 0
              ? 'All reports acknowledged'
              : `${counts.new} ${counts.new === 1 ? 'report needs' : 'reports need'} acknowledgement`}
          </p>
        </div>

        {counts.new > 0 && (
          <button
            onClick={handleAcknowledgeLatest}
            type="button"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors active:scale-95"
          >
            <CheckCircle className="w-4 h-4" aria-hidden="true" />
            <span>Acknowledge latest</span>
          </button>
        )}
      </section>

      {/* 3. Incident list */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden flex flex-col">
        {/* Search & Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" aria-hidden="true" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search incidents"
                placeholder="Search resident, ID or area"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-900 dark:focus:border-slate-400 outline-none transition-all placeholder:text-slate-500 dark:placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                aria-label="Filter by emergency type"
                className={`${selectClass} flex-1 sm:flex-initial`}
              >
                <option value="all">All types</option>
                <option value="medical">Medical</option>
                <option value="fire">Fire</option>
                <option value="crime">Crime</option>
                <option value="traffic">Traffic accident</option>
                <option value="disaster">Disaster</option>
              </select>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                aria-label="Sort incidents"
                className={`${selectClass} flex-1 sm:flex-initial`}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="status">By status</option>
              </select>
            </div>
          </div>

          {/* Status filter: the only place status counts appear */}
          <div role="group" aria-label="Filter by status" className="flex items-center gap-1 overflow-x-auto py-0.5">
            {[
              { key: 'all', label: 'All', count: counts.all },
              { key: 'new', label: 'New', count: counts.new },
              { key: 'acknowledged', label: 'Acknowledged', count: counts.acknowledged },
              { key: 'responding', label: 'Responding', count: counts.responding },
              { key: 'resolved', label: 'Resolved', count: counts.resolved },
              { key: 'false alarm', label: 'False alarm', count: counts.false_alarm }
            ].map((s) => {
              const active = selectedStatus === s.key;
              return (
                <button
                  key={s.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedStatus(s.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-slate-900 dark:bg-slate-700 text-white'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {s.label} <span className="font-mono">{s.count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {incidents.length === 0 ? (
          <div className="py-12 px-4 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center gap-3">
            <p>{isLoading ? 'Loading incidents...' : 'No incident reports match these filters.'}</p>
            {!isLoading && hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Wide screens: table */}
            <div className="hidden xl:block w-full">
              <table className="w-full text-left text-sm divide-y divide-slate-100 dark:divide-slate-800/70">
                <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-mono text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 font-medium">Time</th>
                    <th className="py-3 px-4 font-medium">Emergency</th>
                    <th className="py-3 px-4 font-medium">Resident</th>
                    <th className="py-3 px-4 font-medium">Location</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                  {incidents.map((inc) => {
                    const isNew = inc.status === 'New';
                    return (
                      <tr
                        key={inc.id}
                        className={`transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${
                          isNew ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''
                        }`}
                      >
                        <td className={`py-3.5 px-4 font-mono text-xs whitespace-nowrap ${isNew ? 'font-bold text-rose-600 dark:text-rose-400' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                          {formatClock(inc.receipt_time)}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap"><EmergencyBadge type={inc.emergency_type} /></td>
                        <td className="py-3.5 px-4"><ResidentCell incident={inc} /></td>
                        <td className="py-3.5 px-4"><LocationCell incident={inc} /></td>
                        <td className="py-3.5 px-4 whitespace-nowrap"><StatusControl incident={inc} onChange={handleInlineStatusChange} /></td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-right"><OpenLink incident={inc} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Narrower screens: one card per report */}
            <ul className="xl:hidden divide-y divide-slate-100 dark:divide-slate-800/70">
              {incidents.map((inc) => {
                const isNew = inc.status === 'New';
                return (
                  <li
                    key={inc.id}
                    className={`p-4 flex flex-col gap-3 ${isNew ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <EmergencyBadge type={inc.emergency_type} />
                      <span className={`font-mono text-xs ${isNew ? 'font-bold text-rose-600 dark:text-rose-400' : 'font-medium text-slate-600 dark:text-slate-300'}`}>
                        {formatClock(inc.receipt_time)}
                      </span>
                    </div>
                    <ResidentCell incident={inc} />
                    <LocationCell incident={inc} />
                    <div className="flex items-center justify-between gap-3">
                      <StatusControl incident={inc} onChange={handleInlineStatusChange} />
                      <OpenLink incident={inc} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
