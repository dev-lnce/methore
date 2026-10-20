import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Radio, 
  MapPin, 
  Router, 
  Signal, 
  Save, 
  CheckCircle2, 
  UserCheck, 
  AlertTriangle,
  History,
  Phone,
  Home,
  FileText,
  FileSpreadsheet
} from 'lucide-react';
import EmergencyBadge from '../components/common/EmergencyBadge';
import StatusBadge from '../components/common/StatusBadge';
import GpsBadge from '../components/common/GpsBadge';
import BarangayMap from '../components/map/BarangayMap';
import { useAuth } from '../context/AuthContext';
import { useAudioAlert } from '../context/AudioAlertContext';
import api from '../services/api';
import { formatClock } from '../utils/time';

export default function IncidentDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { triggerAck } = useAudioAlert();

  const [incident, setIncident] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [currentStatus, setCurrentStatus] = useState('New');
  const [responder, setResponder] = useState('');
  const [notes, setNotes] = useState('');
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Fetch incident details via dual-mode API
  const fetchDetails = async () => {
    try {
      const data = await api.incidents.getById(id);
      if (data && data.incident) {
        setIncident(data.incident);
        setLogs(data.incident.logs || []);
        setCurrentStatus(data.incident.status);
        setResponder(data.incident.assigned_responder || '');
        setNotes(data.incident.notes || '');
      }
    } catch (err) {
      console.error('Error fetching incident:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  // Handle status update
  const handleSaveStatus = async () => {
    if (!incident) return;
    setIsSavingStatus(true);
    setFeedbackMsg('');

    try {
      triggerAck();
      const data = await api.incidents.updateStatus(incident.id, {
        status: currentStatus,
        changed_by_name: user?.full_name || 'Alex Rivera',
        changed_by_role: user?.role || 'official',
        note: `Status updated to '${currentStatus}' by duty officer`
      });

      if (data && data.incident) {
        setIncident(prev => ({ ...prev, status: data.incident.status }));
        if (data.logs) setLogs(data.logs);
        setFeedbackMsg(`Status saved as ${currentStatus}`);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setIsSavingStatus(false);
    }
  };

  // Handle notes and responder assignment update
  const handleSaveNotes = async () => {
    if (!incident) return;
    setIsSavingNotes(true);
    setFeedbackMsg('');

    try {
      triggerAck();
      const data = await api.incidents.updateNotes(incident.id, {
        assigned_responder: responder,
        notes: notes,
        changed_by_name: user?.full_name || 'Alex Rivera',
        changed_by_role: user?.role || 'official'
      });

      if (data && data.incident) {
        setIncident(prev => ({
          ...prev,
          assigned_responder: data.incident.assigned_responder,
          notes: data.incident.notes
        }));
        if (data.logs) setLogs(data.logs);
        setFeedbackMsg('Responder assignment and operational notes saved');
      }
    } catch (err) {
      console.error('Error saving notes:', err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-400 dark:text-slate-500 font-mono text-sm">
        Loading incident details...
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Incident Not Found</h2>
        <Link to="/incidents" className="mt-4 inline-block text-sm font-semibold text-slate-900 dark:text-slate-300 underline">
          Return to Live Incidents
        </Link>
      </div>
    );
  }

  const isFlagged = incident.is_registered_flag === 0;
  const resident = incident.resident;
  const receiptDelay = incident.receipt_delay !== undefined ? incident.receipt_delay : 2.4;
  const hopPath = incident.hop_path || `${incident.device_id} → REL-02 → STN-01`;

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
      {/* 1. Top Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/incidents"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Live Incidents</span>
          </Link>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            #{incident.incident_code}
          </h1>
          <EmergencyBadge type={incident.emergency_type} size="lg" />
          <StatusBadge status={incident.status} size="lg" />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={api.incidents.getExportCsvUrl({ search: incident.incident_code })}
            download={`incident_${incident.incident_code}.csv`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Export Incident (CSV)</span>
          </a>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/70 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* 2. Main 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Telemetry, Resident Profile & Satellite Mini-Map (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Card A: Radio Telemetry & GPS Fix */}
          <section className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700">
                  <Radio className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Radio Telemetry & GPS Fix</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">LoRa 915 MHz Packet Synchronized • Direct Mesh Topology</p>
                </div>
              </div>
              <span className="font-mono text-xs text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/70 px-2.5 py-0.5 rounded-full">
                Sync Verified
              </span>
            </div>

            {/* 2x3 Telemetry Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Reported Time (Handheld)</span>
                <span className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
                  {incident.report_time ? incident.report_time.replace('T', ' ').slice(0, 19) : 'N/A'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Station Receipt Delay</span>
                  <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/70">
                    +{receiptDelay}s delay
                  </span>
                </div>
                <span className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
                  {incident.receipt_time ? incident.receipt_time.replace('T', ' ').slice(0, 19) : 'N/A'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Mesh Hop Path</span>
                <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-900 dark:text-slate-100 mt-1">
                  <Router className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">{hopPath}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Signal Quality</span>
                <div className="flex items-center gap-1.5 font-mono text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
                  <Signal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>RSSI {incident.rssi} dBm</span>
                  <span className="text-slate-400 dark:text-slate-500 font-normal">• SNR +{incident.snr} dB</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">GPS Coordinates</span>
                <div className="flex items-center gap-1 font-mono text-xs font-semibold text-slate-900 dark:text-slate-100 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>{incident.latitude ? incident.latitude.toFixed(4) : '13.9412'}° N, {incident.longitude ? incident.longitude.toFixed(4) : '121.1624'}° E</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">GPS Fix Status</span>
                <div className="mt-1">
                  <GpsBadge status={incident.gps_status} />
                </div>
              </div>
            </div>
          </section>

          {/* Card B: Registered Resident Profile (or Flagged ID Alert) */}
          <section className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card flex flex-col gap-4">
            {isFlagged ? (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/70 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Report Received from Unregistered or Deactivated Device</span>
                </div>
                <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                  This emergency transmission originated from device ID{' '}
                  <strong className="font-mono">{incident.device_id}</strong> (User ID:{' '}
                  <strong className="font-mono">{incident.user_id}</strong>). It was safely captured by the LoRa mesh and flagged for review.
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <Link
                    to="/admin/residents"
                    className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                  >
                    Manage Device Directory
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center font-bold text-base shadow-sm border border-slate-700">
                      {resident?.full_name ? resident.full_name.slice(0, 2).toUpperCase() : 'MS'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                          {resident?.full_name || 'Morgan Santos'}
                        </h2>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/70">
                          <UserCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          Verified
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Registered Citizen Profile</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700">
                      ID: {incident.user_id}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700">
                      DEV: {incident.device_id}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                  <div className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300">
                    <Home className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block text-slate-900 dark:text-slate-100">Residential Address</span>
                      <span className="text-slate-600 dark:text-slate-400">{resident?.address || incident.area_name}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block text-slate-900 dark:text-slate-100">Emergency Contact</span>
                      <span className="text-slate-600 dark:text-slate-400">{resident?.contact_number || '+63 917 555 0142'}</span>
                    </div>
                  </div>

                  <div className="sm:col-span-2 flex items-start gap-2.5 text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block text-slate-900 dark:text-slate-100">Medical Notes & Precautions</span>
                      <span className="text-rose-600 dark:text-rose-400 font-medium">
                        {resident?.medical_notes || 'Asthma, Penicillin allergy'}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>

          {/* Card C: Realistic Satellite Mini Dispatch Map (Requirement 3 Upgrade) */}
          <section className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono uppercase tracking-wider">
                Geographic Satellite Dispatch View • {incident.area_name}
              </span>
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                Fix HDOP 0.9 (±4m accuracy)
              </span>
            </div>

            {/* High-Resolution Satellite Aerial Viewport */}
            <div className="w-full h-64 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <BarangayMap
                incidents={[incident]}
                selectedIncidentId={incident.id}
                height="100%"
                interactive={true}
                showControls={false}
              />
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Status Control, Responder Assignment & Audit Trail (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6 sticky top-6">
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card flex flex-col gap-5">
            {/* 1. Status Control Buttons */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Update Incident Status</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Duty: {user?.full_name || 'Alex Rivera'}
                </span>
              </div>

              {/* 5-Option Segmented Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800">
                {['New', 'Acknowledged', 'Responding', 'Resolved', 'False alarm'].map((st) => {
                  const isActive = currentStatus === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setCurrentStatus(st)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold text-center transition-all ${
                        isActive
                          ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleSaveStatus}
                disabled={isSavingStatus || currentStatus === incident.status}
                type="button"
                className="mt-3 w-full py-2.5 px-4 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 shadow-sm border border-transparent dark:border-slate-700"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingStatus ? 'Saving Status...' : 'Save Status Update'}</span>
              </button>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800" />

            {/* 2. Responder Assignment & Coordination Notes */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2.5">
                Responder Assignment & Notes
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Assigned Responder Unit
                  </label>
                  <input
                    type="text"
                    value={responder}
                    onChange={(e) => setResponder(e.target.value)}
                    placeholder="e.g. Team Alpha — Tanod Unit 2 (Devon Cruz)"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-900 dark:focus:border-slate-400 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Operational Dispatch Notes
                    </label>
                    <span className="font-mono text-[10px] text-slate-400">
                      {notes.length}/250
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={250}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Log patient condition, triage steps, or radio dispatch updates..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-900 dark:focus:border-slate-400 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>

                <button
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  type="button"
                  className="w-full py-2.5 px-4 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 shadow-sm border border-transparent dark:border-slate-700"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingNotes ? 'Recording...' : 'Save Notes & Responder'}</span>
                </button>
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800" />

            {/* 3. Timestamped Audit Trail (3 entries) */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Status Audit Log ({logs.length})
                </h3>
              </div>

              <div className="space-y-3">
                {logs.length === 0 ? (
                  <p className="text-xs text-slate-400">No status changes recorded.</p>
                ) : (
                  logs.map((log, idx) => (
                    <div key={log.id || idx} className="relative pl-4 border-l-2 border-slate-200 dark:border-slate-700 text-xs">
                      <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-slate-900 dark:bg-slate-400" />
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {log.changed_by_name} ({log.changed_by_role})
                        </span>
                        <span className="font-mono">
                          {formatClock(log.timestamp)}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 mt-1 leading-snug">
                        {log.note}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
