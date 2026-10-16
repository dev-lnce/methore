import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  AlertTriangle, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Power, 
  Smartphone, 
  ShieldAlert, 
  ArrowRight,
  Check,
  X
} from 'lucide-react';
import EmergencyBadge from '../components/common/EmergencyBadge';

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

  // Fetch directory and flagged reports
  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const [resResidents, resFlagged] = await Promise.all([
        fetch(`/api/residents?${params.toString()}`),
        fetch('/api/residents/flagged-reports')
      ]);

      if (resResidents.ok) {
        const data = await resResidents.json();
        setResidents(data.residents || []);
        if (data.summary) setSummary(data.summary);
      }

      if (resFlagged.ok) {
        const flaggedData = await resFlagged.json();
        setFlaggedReports(flaggedData.reports || []);
      }
    } catch (err) {
      console.error('Error fetching residents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, statusFilter]);

  // Handle new registration submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/residents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register resident');
      }

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
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingResident) return;

    try {
      const res = await fetch(`/api/residents/${editingResident.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingResident)
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Update failed');
        return;
      }

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
      const res = await fetch(`/api/residents/${resident.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newActive })
      });

      if (res.ok) {
        setConfirmModal({ isOpen: false, resident: null });
        fetchData();
      }
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
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Residents & Handheld Devices
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Local Resident Registry & Collision-Free LoRa Node Allocations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full font-semibold">
            {summary.active} Active Handhelds Linked
          </span>
        </div>
      </div>

      {/* 2. Top Bento Summary Row (Left Hero 4-col + Right Flagged Reports 8-col) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Hero Card (Dark Slate #0F172A, 4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-card border border-slate-800 min-h-[220px]">
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

        {/* Right Flagged Unregistered Reports Card (Clean Warning, 8 Cols) */}
        <div className="lg:col-span-8 bg-amber-50/70 border border-amber-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-amber-200/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {flaggedReports.length} Reports from Unregistered or Deactivated Devices
                  </h3>
                  <span className="text-xs text-amber-800 font-medium">
                    (Captured by LoRa Mesh — Never Silently Dropped)
                  </span>
                </div>
              </div>

              <span className="font-mono text-xs text-amber-900 bg-amber-200/60 px-2.5 py-1 rounded-xl font-semibold">
                Live Catch-All Queue
              </span>
            </div>

            {/* List of Flagged Alerts */}
            <div className="space-y-2.5 mt-3">
              {flaggedReports.length === 0 ? (
                <p className="text-xs text-amber-800 py-3">
                  No flagged reports. All incoming mesh traffic originates from active registered devices.
                </p>
              ) : (
                flaggedReports.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-3.5 border border-amber-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-start md:items-center gap-2.5 min-w-0">
                      <EmergencyBadge type={item.emergency_type} />
                      <p className="text-xs text-slate-800 leading-tight">
                        Today <span className="font-mono font-semibold">{item.receipt_time?.slice(11, 19)}</span> •{' '}
                        Device <strong className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{item.device_id}</strong>{' '}
                        (User ID: <span className="font-mono text-rose-600 font-bold">{item.user_id}</span>) • {item.area_name}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                      <button
                        onClick={() => handleQuickRegisterFlagged(item)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
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

      {/* 3. Main Split Workspace (4-col Registration Form + 8-col Residents Directory) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Register Resident & Link Device (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-card flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Register Resident & Device</h2>
            <span className="font-mono text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-semibold">
              New Entry
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Allocate a collision-free User ID and bind an active 915 MHz handheld node.
          </p>

          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold">
              {formError}
            </div>
          )}

          {formSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold">
              {formSuccess}
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Unique Resident User ID (RES-*)
              </label>
              <input
                type="text"
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value.toUpperCase() })}
                placeholder="e.g. RES-1089"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 font-mono text-xs text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all shadow-sm"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Hardware Device ID (HND-*)
              </label>
              <input
                type="text"
                value={formData.device_id}
                onChange={(e) => setFormData({ ...formData, device_id: e.target.value.toUpperCase() })}
                placeholder="e.g. HND-089"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 font-mono text-xs text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all shadow-sm"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Full Legal Name
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="e.g. Casey Navarro"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all shadow-sm"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Residential Street Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. 14 Mabini St, Purok 2, Barangay San Isidro"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all shadow-sm"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Emergency Contact Number
              </label>
              <input
                type="tel"
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                placeholder="+63 917 555 0189"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 font-mono text-xs text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all shadow-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Medical Notes (Allergies, Mobility)
              </label>
              <textarea
                value={formData.medical_notes}
                onChange={(e) => setFormData({ ...formData, medical_notes: e.target.value })}
                rows={2}
                placeholder="e.g. Hypertension, wheelchair dependent"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all resize-none shadow-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-2xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Registering...' : 'Register Resident & Hardware'}</span>
            </button>
          </form>
        </div>

        {/* Right Directory: Resident Directory Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-card flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-900">Resident Directory</h2>

            {/* Filter controls */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search resident or device ID..."
                  className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-slate-900 transition-all w-56"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">All States</option>
                <option value="active">Active Only</option>
                <option value="deactivated">Deactivated</option>
              </select>
            </div>
          </div>

          {/* Directory Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-100">
              <thead className="bg-slate-50 text-slate-500 font-mono text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">Resident</th>
                  <th className="py-3 px-3">User ID</th>
                  <th className="py-3 px-3">Linked Device</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {residents.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-slate-400 font-mono">
                      No residents found matching criteria.
                    </td>
                  </tr>
                ) : (
                  residents.map((r) => {
                    const isActive = r.is_active === 1;
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900">{r.full_name}</span>
                            <span className="text-[11px] text-slate-500 truncate max-w-[200px]">{r.address}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                          {r.user_id}
                        </td>

                        <td className="py-3 px-3 font-mono text-slate-700">
                          <span className="bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 font-medium">
                            {r.device_id}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium text-[11px] border ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
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
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                              title="Edit Resident"
                              type="button"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setConfirmModal({ isOpen: true, resident: r })}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isActive
                                  ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                  : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-modal max-w-md w-full animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Edit Resident Information</h3>
              <button
                onClick={() => setEditingResident(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 mt-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">User ID</label>
                <input
                  type="text"
                  value={editingResident.user_id}
                  onChange={(e) => setEditingResident({ ...editingResident, user_id: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-mono text-xs text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Device ID</label>
                <input
                  type="text"
                  value={editingResident.device_id}
                  onChange={(e) => setEditingResident({ ...editingResident, device_id: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-mono text-xs text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingResident.full_name}
                  onChange={(e) => setEditingResident({ ...editingResident, full_name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Address</label>
                <input
                  type="text"
                  value={editingResident.address}
                  onChange={(e) => setEditingResident({ ...editingResident, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Contact Number</label>
                <input
                  type="text"
                  value={editingResident.contact_number || ''}
                  onChange={(e) => setEditingResident({ ...editingResident, contact_number: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Medical Notes</label>
                <textarea
                  value={editingResident.medical_notes || ''}
                  onChange={(e) => setEditingResident({ ...editingResident, medical_notes: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingResident(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Toggle Status */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-modal max-w-sm w-full animate-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-slate-900">
              {confirmModal.resident?.is_active === 1 ? 'Deactivate Resident Hardware?' : 'Reactivate Resident Hardware?'}
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {confirmModal.resident?.is_active === 1
                ? `Deactivating ${confirmModal.resident?.full_name} (${confirmModal.resident?.user_id}) will flag any future LoRa emergency reports from hardware ${confirmModal.resident?.device_id} on the console.`
                : `Reactivating will restore normal registered verification for ${confirmModal.resident?.full_name}.`}
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, resident: null })}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusToggle}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white ${
                  confirmModal.resident?.is_active === 1
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {confirmModal.resident?.is_active === 1 ? 'Yes, Deactivate' : 'Yes, Reactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
