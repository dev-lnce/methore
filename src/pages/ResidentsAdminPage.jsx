import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  AlertTriangle, 
  Search, 
  CheckCircle2, 
  Edit3, 
  Power, 
  X
} from 'lucide-react';
import EmergencyBadge from '../components/common/EmergencyBadge';
import api from '../services/api';

export default function ResidentsAdminPage() {
  const [residents, setResidents] = useState([]);
  const [flaggedReports, setFlaggedReports] = useState([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, deactivated: 0, flaggedReports: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // New Registration Form State
  const [formData, setFormData] = useState({
    user_id: '',
    device_id: '',
    full_name: '',
    address: 'Barangay San Isidro',
    contact_number: '',
    medical_notes: '',
    is_active: 1
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Modal State
  const [editingResident, setEditingResident] = useState(null);

  // Deactivate/Activate Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, resident: null });

  // Fetch directory and flagged reports via dual-mode API
  const fetchData = async () => {
    try {
      const [resResidents, resFlagged] = await Promise.all([
        api.residents.getAll({ search, status: statusFilter }),
        api.residents.getFlaggedReports()
      ]);

      if (resResidents && resResidents.residents) {
        setResidents(resResidents.residents);
        if (resResidents.summary) setSummary(resResidents.summary);
      }

      if (resFlagged && resFlagged.reports) {
        setFlaggedReports(resFlagged.reports);
      }
    } catch (err) {
      console.error('Error fetching residents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const handleReset = () => fetchData();
    window.addEventListener('methore_data_reset', handleReset);
    return () => window.removeEventListener('methore_data_reset', handleReset);
  }, [search, statusFilter]);

  // Handle new registration submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setIsSubmitting(true);

    try {
      const data = await api.residents.create(formData);
      setFormSuccess(data.message || 'Resident registered successfully');
      setFormData({
        user_id: '',
        device_id: '',
        full_name: '',
        address: 'Barangay San Isidro',
        contact_number: '',
        medical_notes: '',
        is_active: 1
      });
      fetchData();
    } catch (err) {
      setFormError(err.message || 'Failed to register resident');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingResident) return;

    try {
      await api.residents.update(editingResident.id, editingResident);
      setEditingResident(null);
      fetchData();
    } catch (err) {
      alert('Error updating resident: ' + err.message);
    }
  };

  // Toggle active status
  const handleConfirmStatusToggle = async () => {
    const resident = confirmModal.resident;
    if (!resident) return;

    const newActive = resident.is_active === 1 ? 0 : 1;
    try {
      await api.residents.toggleStatus(resident.id, newActive);
      setConfirmModal({ isOpen: false, resident: null });
      fetchData();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  // Quick fill form from flagged alert
  const handleQuickRegisterFlagged = (report) => {
    setFormData(prev => ({
      ...prev,
      user_id: report.user_id,
      device_id: report.device_id,
      full_name: 'Citizen (' + report.user_id + ')',
      address: report.area_name || 'Barangay San Isidro'
    }));
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
      {/* 1. Header (Clean context, no multi-line bloated jargon) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Residents & Devices
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Local resident registry and handheld device allocations ({summary.total} registered)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/70 px-3 py-1.5 rounded-full font-semibold">
            {summary.active} Active Handhelds Linked
          </span>
        </div>
      </div>

      {/* 2. Top Bento Summary Row (Left Hero 4-col + Right Flagged Reports 8-col) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Hero Card (Dark Slate, 4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900 dark:bg-slate-900/90 text-white rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-card border border-slate-800 dark:border-slate-700/80 min-h-[220px]">
          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                LOCAL REGISTRY
              </span>
              <span className="font-mono text-xs text-emerald-400 bg-white/10 px-2 py-0.5 rounded-full">
                CH 02 Active
              </span>
            </div>

            <div className="mt-2">
              <div className="text-4xl font-extrabold text-white tracking-tight leading-none">
                {summary.total}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Registered Community Residents
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between pt-4 mt-4 border-t border-white/10 text-xs">
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {summary.active} Active Linked
            </span>
            <span className="text-slate-400">
              {summary.deactivated} Deactivated
            </span>
          </div>
        </div>

        {/* Right Flagged Unregistered Reports Card (Clean Warning, 8 Cols - Subtitle Bloat Removed) */}
        <div className="lg:col-span-8 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/70 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-amber-200/60 dark:border-amber-800/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {flaggedReports.length} Reports from Unregistered or Deactivated Devices
                  </h3>
                </div>
              </div>

              <span className="font-mono text-xs text-amber-900 dark:text-amber-300 bg-amber-200/60 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-700 px-2.5 py-1 rounded-xl font-semibold">
                Live Catch-All Queue
              </span>
            </div>

            {/* List of Flagged Alerts */}
            <div className="space-y-2.5 mt-3">
              {flaggedReports.length === 0 ? (
                <p className="text-xs text-amber-800 dark:text-amber-300 py-3">
                  No flagged reports. All incoming mesh traffic originates from active registered devices.
                </p>
              ) : (
                flaggedReports.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-[#111827] rounded-2xl p-3.5 border border-amber-200/80 dark:border-amber-800/70 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-start md:items-center gap-2.5 min-w-0">
                      <EmergencyBadge type={item.emergency_type} />
                      <p className="text-xs text-slate-800 dark:text-slate-200 leading-tight">
                        Today <span className="font-mono font-semibold">{item.receipt_time?.slice(11, 19)}</span> •{' '}
                        Device <strong className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-900 dark:text-slate-100">{item.device_id}</strong>{' '}
                        (User ID: <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">{item.user_id}</span>) • {item.area_name}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                      <button
                        onClick={() => handleQuickRegisterFlagged(item)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors border border-transparent dark:border-slate-700"
                        type="button"
                      >
                        Register Device
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Split Workspace (4-col Registration Form + 8-col Directory) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Register Resident & Link Device (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Register Resident & Device</h2>
            <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/70 px-2.5 py-0.5 rounded-full font-semibold">
              New Entry
            </span>
          </div>

          {formError && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/70 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {formError}
            </div>
          )}

          {formSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/70 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{formSuccess}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  User ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RES-1013"
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-900 dark:focus:border-slate-400 outline-none uppercase transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Device ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HND-013"
                  value={formData.device_id}
                  onChange={(e) => setFormData({ ...formData, device_id: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-900 dark:focus:border-slate-400 outline-none uppercase transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="Full citizen name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-900 dark:focus:border-slate-400 outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Residential Address *
              </label>
              <input
                type="text"
                required
                placeholder="Street address & Purok"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-900 dark:focus:border-slate-400 outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Emergency Contact Number
              </label>
              <input
                type="text"
                placeholder="+63 9XX XXX XXXX"
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-900 dark:focus:border-slate-400 outline-none transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Medical Notes & Conditions
                </label>
                <span className="text-[10px] text-slate-400">
                  {formData.medical_notes.length}/250
                </span>
              </div>
              <textarea
                rows={2}
                maxLength={250}
                placeholder="Allergies, chronic conditions, disabilities..."
                value={formData.medical_notes}
                onChange={(e) => setFormData({ ...formData, medical_notes: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-900 dark:focus:border-slate-400 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 border border-transparent dark:border-slate-700"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Registering...' : 'Register Resident & Device'}</span>
            </button>
          </form>
        </div>

        {/* Right 8-col: Residents Directory Table */}
        <div className="lg:col-span-8 bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card flex flex-col overflow-hidden">
          {/* Table Header Filter Bar */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search citizen, ID, device, street..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-slate-900 dark:focus:border-slate-400 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer focus:border-slate-900 dark:focus:border-slate-400"
              >
                <option value="all">All Statuses ({summary.total})</option>
                <option value="active">Active Only ({summary.active})</option>
                <option value="deactivated">Deactivated Only ({summary.deactivated})</option>
              </select>
            </div>
          </div>

          {/* Directory Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm divide-y divide-slate-100 dark:divide-slate-800/70">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-mono text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">Resident & Address</th>
                  <th className="py-3 px-3">User ID</th>
                  <th className="py-3 px-3">Device ID</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 bg-white dark:bg-[#111827]">
                {residents.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-slate-400 dark:text-slate-500 font-mono text-xs">
                      {isLoading ? 'Loading resident registry...' : 'No residents match your search.'}
                    </td>
                  </tr>
                ) : (
                  residents.map((r) => {
                    const isActive = r.is_active === 1;
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">{r.full_name}</span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{r.address}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-mono font-semibold text-slate-800 dark:text-slate-200">
                          {r.user_id}
                        </td>

                        <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 font-medium">
                            {r.device_id}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium text-[11px] border ${
                              isActive
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/70'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}
                            />
                            <span>{isActive ? 'Active' : 'Deactivated'}</span>
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingResident({ ...r })}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Edit Resident"
                              type="button"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setConfirmModal({ isOpen: true, resident: r })}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isActive
                                  ? 'text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                                  : 'text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                              }`}
                              title={isActive ? 'Deactivate Device' : 'Reactivate Device'}
                              type="button"
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                          </div>
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

      {/* Edit Resident Modal */}
      {editingResident && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-modal max-w-md w-full animate-in zoom-in-95 duration-150 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold">Edit Resident Information</h3>
              <button
                onClick={() => setEditingResident(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 mt-4">
              <div>
                <label className="text-xs font-semibold block mb-1">User ID</label>
                <input
                  type="text"
                  value={editingResident.user_id}
                  onChange={(e) => setEditingResident({ ...editingResident, user_id: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono uppercase"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Device ID</label>
                <input
                  type="text"
                  value={editingResident.device_id}
                  onChange={(e) => setEditingResident({ ...editingResident, device_id: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono uppercase"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingResident.full_name}
                  onChange={(e) => setEditingResident({ ...editingResident, full_name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Residential Address</label>
                <input
                  type="text"
                  value={editingResident.address}
                  onChange={(e) => setEditingResident({ ...editingResident, address: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Emergency Contact</label>
                <input
                  type="text"
                  value={editingResident.contact_number || ''}
                  onChange={(e) => setEditingResident({ ...editingResident, contact_number: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Medical Notes</label>
                <textarea
                  rows={2}
                  value={editingResident.medical_notes || ''}
                  onChange={(e) => setEditingResident({ ...editingResident, medical_notes: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingResident(null)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold hover:bg-slate-800"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate/Activate Confirmation Modal */}
      {confirmModal.isOpen && confirmModal.resident && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-modal max-w-sm w-full animate-in zoom-in-95 duration-150 text-slate-900 dark:text-slate-100">
            <h3 className="text-sm font-bold">
              {confirmModal.resident.is_active === 1 ? 'Deactivate Device?' : 'Reactivate Device?'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              {confirmModal.resident.is_active === 1
                ? `Deactivating ${confirmModal.resident.full_name}'s device (${confirmModal.resident.device_id}) will cause any future transmissions to be flagged in the unlinked alert queue.`
                : `Reactivating ${confirmModal.resident.full_name}'s device will restore normal citizen dispatch priority.`}
            </p>

            <div className="pt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, resident: null })}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusToggle}
                className={`px-4 py-1.5 rounded-xl text-white text-xs font-semibold ${
                  confirmModal.resident.is_active === 1
                    ? 'bg-rose-600 hover:bg-rose-500'
                    : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {confirmModal.resident.is_active === 1 ? 'Confirm Deactivate' : 'Confirm Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
