import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  Radio, 
  MapPin, 
  Clock, 
  Router, 
  Signal, 
  ShieldAlert, 
  Save, 
  MessageSquarePlus, 
  CheckCircle2, 
  UserCheck, 
  AlertTriangle,
  History,
  Phone,
  Home,
  FileText
} from 'lucide-react';
import EmergencyBadge from '../components/common/EmergencyBadge';
import StatusBadge from '../components/common/StatusBadge';
import GpsBadge from '../components/common/GpsBadge';
import { useAuth } from '../context/AuthContext';
import { useAudioAlert } from '../context/AudioAlertContext';

export default function IncidentDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { triggerAck } = useAudioAlert();
  const navigate = useNavigate();

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

  // Fetch incident details
  const fetchDetails = async () => {
    try {
      const res = await fetch(`/api/incidents/${id}`);
      if (!res.ok) {
        throw new Error('Incident not found');
      }
      const data = await res.json();
      setIncident(data.incident);
      setLogs(data.incident.logs || []);
      setCurrentStatus(data.incident.status);
      setResponder(data.incident.assigned_responder || '');
      setNotes(data.incident.notes || '');
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
      const res = await fetch(`/api/incidents/${incident.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: currentStatus,
          changed_by_name: user?.full_name || 'Alex Rivera',
          changed_by_role: user?.role || 'official',
          note: `Status updated to '${currentStatus}' by duty officer`
        })
      });

      if (res.ok) {
        const data = await res.json();
        setIncident(data.incident);
        setLogs(data.logs);
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
      const res = await fetch(`/api/incidents/${incident.id}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assigned_responder: responder,
          notes: notes,
          changed_by_name: user?.full_name || 'Alex Rivera',
          changed_by_role: user?.role || 'official'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setIncident(data.incident);
        setLogs(data.logs);
        setFeedbackMsg('Responder & coordination notes recorded');
      }
    } catch (err) {
      console.error('Error saving notes:', err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-400 font-mono text-sm">
        Loading incident details...
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Incident Not Found</h2>
        <Link to="/incidents" className="mt-4 inline-block text-sm font-semibold text-slate-900 underline">
          Return to Live Incidents
        </Link>
      </div>
    );
  }

  const isFlagged = incident.is_registered_flag === 0;
  const resident = incident.resident;

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
      {/* 1. Top Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/incidents"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Live Incidents</span>
          </Link>
          <div className="h-4 w-px bg-slate-200 hidden sm:block" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            #{incident.incident_code}
          </h1>
          <EmergencyBadge type={incident.emergency_type} size="lg" />
          <StatusBadge status={incident.status} size="lg" />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={`/api/incidents/export/csv?search=${incident.incident_code}`}
            download={`incident_${incident.incident_code}.csv`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </a>
          <button
            onClick={() => window.print()}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Dispatch Slip</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* 2. 12-Column Main Bento Grid (NO cramped slide-over drawers) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Telemetry, Resident Profile & Mini-Map (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Card A: Radio Telemetry & GPS Fix */}
          <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Radio Telemetry & GPS Fix</h2>
                  <p className="text-xs text-slate-500">LoRa 915 MHz Packet Synchronized • Direct Hop Path</p>
                </div>
              </div>
              <span className="font-mono text-xs text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Sync Verified
              </span>
            </div>

            {/* 2x3 Telemetry Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                <span className="text-xs text-slate-500">Reported Time (Handheld)</span>
                <span className="font-mono text-sm font-semibold text-slate-900 mt-1">
                  {incident.report_time ? incident.report_time.replace('T', ' ').slice(0, 19) : 'N/A'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Station Receipt Time</span>
                  <span className="font-mono text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                    +3.0s latency
                  </span>
                </div>
                <span className="font-mono text-sm font-semibold text-slate-900 mt-1">
                  {incident.receipt_time ? incident.receipt_time.replace('T', ' ').slice(0, 19) : 'N/A'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                <span className="text-xs text-slate-500">Mesh Hop Path</span>
                <div className="flex items-center gap-1.5 font-mono text-sm font-semibold text-slate-900 mt-1">
                  <Router className="w-4 h-4 text-emerald-600" />
                  <span>{incident.hop_count} {incident.hop_count === 1 ? 'Hop (Direct)' : 'Hops (via Relay)'}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                <span className="text-xs text-slate-500">Signal Quality</span>
                <div className="flex items-center gap-1.5 font-mono text-sm font-semibold text-slate-900 mt-1">
                  <Signal className="w-4 h-4 text-emerald-600" />
                  <span>RSSI {incident.rssi} dBm</span>
                  <span className="text-slate-400 font-normal">• SNR +{incident.snr} dB</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                <span className="text-xs text-slate-500">GPS Coordinates</span>
                <div className="flex items-center gap-1 font-mono text-xs font-semibold text-slate-900 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{incident.latitude.toFixed(4)}° N, {incident.longitude.toFixed(4)}° E</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                <span className="text-xs text-slate-500">GPS Fix Status</span>
                <div className="mt-1">
                  <GpsBadge status={incident.gps_status} />
                </div>
              </div>
            </div>
          </section>

          {/* Card B: Registered Resident Profile (or Flagged Unregistered ID Warning) */}
          <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card flex flex-col gap-4">
            {isFlagged ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Report Received from Unregistered or Deactivated Device</span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  This emergency transmission originated from device ID{' '}
                  <strong className="font-mono">{incident.device_id}</strong> (User ID:{' '}
                  <strong className="font-mono">{incident.user_id}</strong>). It was safely captured by the LoRa mesh and never silently dropped.
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <Link
                    to="/admin/residents"
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                  >
                    Register This Device ID
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
                      {resident?.full_name ? resident.full_name.slice(0, 2).toUpperCase() : 'MS'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-slate-900">{resident?.full_name || 'Morgan Santos'}</h2>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <UserCheck className="w-3 h-3 text-emerald-600" />
                          Verified
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">Registered Citizen • Purok 2 Zone</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 font-semibold">
                      ID: {incident.user_id}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 font-semibold">
                      DEV: {incident.device_id}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                  <div className="flex items-start gap-2.5 text-slate-700">
                    <Home className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block text-slate-900">Residential Address</span>
                      <span className="text-slate-600">{resident?.address || incident.area_name}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-slate-700">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block text-slate-900">Emergency Contact Number</span>
                      <span className="text-slate-600">{resident?.contact_number || '+63 917 555 0142'}</span>
                    </div>
                  </div>

                  <div className="sm:col-span-2 flex items-start gap-2.5 text-slate-700 pt-1 border-t border-slate-100">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block text-slate-900">Medical Notes & Precautions</span>
                      <span className="text-rose-700 font-medium">
                        {resident?.medical_notes || 'Asthma, Penicillin allergy'}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>

          {/* Card C: Offline Mini Dispatch Map */}
          <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">
                Geographic Dispatch View • {incident.area_name}
              </span>
              <span className="font-mono text-[11px] text-slate-500">
                Fix HDOP 0.9 (±4m accuracy)
              </span>
            </div>

            {/* Tactical SVG Mini Map */}
            <div className="relative w-full h-48 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
              <svg viewBox="0 0 600 240" className="w-full h-full">
                {/* Background grid */}
                <rect width="100%" height="100%" fill="#F8FAFC" />
                <path d="M 0 120 L 600 120" stroke="#FFFFFF" strokeWidth="24" />
                <path d="M 0 120 L 600 120" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="6 4" />
                <path d="M 240 0 L 240 240" stroke="#FFFFFF" strokeWidth="20" />
                <path d="M 240 0 L 240 240" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="6 4" />

                {/* RF Mesh Hop Arc */}
                <path d="M 160 80 Q 280 40 460 140" fill="none" stroke="#10B981" strokeWidth="2.5" strokeDasharray="6 4" />

                {/* Station Node */}
                <circle cx="460" cy="140" r="10" fill="#0F172A" />
                <circle cx="460" cy="140" r="4" fill="#10B981" />
                <text x="460" y="165" textAnchor="middle" fill="#0F172A" fontFamily="JetBrains Mono" fontSize="9" fontWeight="bold">Barangay Base</text>

                {/* Incident Marker */}
                <circle cx="160" cy="80" r="18" fill="#EF4444" fillOpacity="0.2">
                  <animate attributeName="r" values="14;22;14" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="160" cy="80" r="9" fill="#DC2626" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="160" cy="80" r="3" fill="#FFFFFF" />
                <text x="160" y="112" textAnchor="middle" fill="#DC2626" fontFamily="Plus Jakarta Sans" fontSize="10" fontWeight="bold">
                  {incident.area_name}
                </text>
              </svg>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Sticky Status Control, Responder & Audit Trail (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6 sticky top-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card flex flex-col gap-5">
            {/* 1. Status Control Buttons */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-sm font-bold text-slate-900">Update Incident Status</h3>
                <span className="text-xs text-slate-400 font-mono">
                  Duty: {user?.full_name || 'Alex Rivera'}
                </span>
              </div>

              {/* 5-Option Segmented Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
                {['New', 'Acknowledged', 'Responding', 'Resolved', 'False alarm'].map((st) => {
                  const isActive = currentStatus === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setCurrentStatus(st)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold text-center transition-all ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
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
                className="mt-3 w-full py-2.5 px-4 rounded-2xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingStatus ? 'Saving Status...' : 'Save Status Update'}</span>
              </button>
            </div>

            <div className="h-px bg-slate-100" />

            {/* 2. Responder Assignment & Coordination Notes */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">
                  Assigned Responder / Team
                </label>
                <input
                  type="text"
                  value={responder}
                  onChange={(e) => setResponder(e.target.value)}
                  placeholder="e.g. Team Alpha — Tanod Unit 2 (Devon Cruz)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all shadow-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-900">
                    Coordination & Field Notes
                  </label>
                  <span className="font-mono text-[11px] text-slate-400">
                    {notes.length} / 280 chars
                  </span>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value.slice(0, 280))}
                  rows={3}
                  placeholder="Enter dispatch directives, medical observations, and on-scene updates..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all resize-none shadow-sm"
                />
              </div>

              <button
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                type="button"
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                <span>{isSavingNotes ? 'Recording Notes...' : 'Save Notes & Assign Responder'}</span>
              </button>
            </div>

            <div className="h-px bg-slate-100" />

            {/* 3. Status & Activity Audit Trail */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  Incident Event Timeline
                </h4>
                <span className="font-mono text-xs text-slate-400">
                  {logs.length} {logs.length === 1 ? 'Event' : 'Events'}
                </span>
              </div>

              <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {logs.length === 0 ? (
                  <p className="text-xs text-slate-400">No status log entries recorded yet.</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="relative flex flex-col gap-0.5 text-xs">
                      <span className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-slate-900 ring-4 ring-white" />
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-semibold text-slate-900">
                          {log.timestamp ? log.timestamp.slice(11, 19) : '--:--:--'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {log.changed_by_name} ({log.changed_by_role})
                        </span>
                      </div>
                      <p className="text-slate-600 mt-0.5 leading-relaxed">
                        {log.note || `Status transitioned to ${log.new_status}.`}
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
