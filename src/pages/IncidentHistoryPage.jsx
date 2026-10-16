import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  History, 
  Download, 
  Search, 
  Calendar, 
  Filter, 
  ChevronRight,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import EmergencyBadge from '../components/common/EmergencyBadge';
import StatusBadge from '../components/common/StatusBadge';
import GpsBadge from '../components/common/GpsBadge';

export default function IncidentHistoryPage() {
  const [incidents, setIncidents] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedType !== 'all') params.append('emergency_type', selectedType);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);

      const res = await fetch(`/api/incidents?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setIncidents(data.incidents || []);
      }
    } catch (err) {
      console.error('Error fetching incident history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [search, selectedType, selectedStatus, dateFrom, dateTo]);

  // Construct export CSV link
  const exportCsvUrl = () => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (selectedType !== 'all') params.append('emergency_type', selectedType);
    if (selectedStatus !== 'all') params.append('status', selectedStatus);
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);
    return `/api/incidents/export/csv?${params.toString()}`;
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
      {/* 1. Header Row with One-Click CSV Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Incident History & Archive
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable offline audit logs & dispatch historical telemetry
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={exportCsvUrl()}
            download="methore_incidents_export.csv"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-sm transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Archive (CSV)</span>
          </a>
        </div>
      </div>

      {/* 2. Unified Filter Toolbar Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-card flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code, citizen, area, notes..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-all shadow-sm"
            />
          </div>

          {/* Emergency Type Selector */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 outline-none cursor-pointer focus:bg-white focus:border-slate-900"
            >
              <option value="all">All Emergency Types</option>
              <option value="medical">Medical</option>
              <option value="fire">Fire</option>
              <option value="crime">Crime</option>
              <option value="traffic">Traffic Accident</option>
              <option value="disaster">Disaster</option>
            </select>
          </div>

          {/* Status Selector */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 outline-none cursor-pointer focus:bg-white focus:border-slate-900"
            >
              <option value="all">All Statuses</option>
              <option value="New">New</option>
              <option value="Acknowledged">Acknowledged</option>
              <option value="Responding">Responding</option>
              <option value="Resolved">Resolved</option>
              <option value="False alarm">False alarm</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSearch('');
                setSelectedType('all');
                setSelectedStatus('all');
                setDateFrom('');
                setDateTo('');
              }}
              className="w-full py-2 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              type="button"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Date Range Row */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Date Filter:
          </span>
          <div className="flex items-center gap-2">
            <label className="text-slate-500">From:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-800 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-slate-500">To:</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-800 outline-none"
            />
          </div>
          <span className="ml-auto font-mono text-xs text-slate-400">
            Archive Count: <strong className="text-slate-800">{incidents.length}</strong> records
          </span>
        </div>
      </div>

      {/* 3. Incident History Archive Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden flex flex-col">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm divide-y divide-slate-100">
            <thead className="bg-slate-50 text-slate-500 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Receipt Time</th>
                <th className="py-3 px-4">Emergency</th>
                <th className="py-3 px-4">Citizen & Hardware</th>
                <th className="py-3 px-4">Area & GPS</th>
                <th className="py-3 px-4">Assigned Unit</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400 font-mono text-xs">
                    {isLoading ? 'Loading archive records...' : 'No historical incident records match the selected filters.'}
                  </td>
                </tr>
              ) : (
                incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Code */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {inc.incident_code}
                    </td>

                    {/* Receipt Time */}
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600 whitespace-nowrap">
                      {inc.receipt_time ? inc.receipt_time.replace('T', ' ').slice(0, 19) : '--'}
                    </td>

                    {/* Emergency Type */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <EmergencyBadge type={inc.emergency_type} />
                    </td>

                    {/* Resident & IDs */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">
                          {inc.resident_name || (inc.is_registered_flag === 1 ? 'Registered Resident' : 'Unregistered ID')}
                        </span>
                        <span className="font-mono text-xs text-slate-400">
                          {inc.user_id} • {inc.device_id}
                        </span>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="text-slate-800 font-medium text-xs truncate max-w-[160px]">
                          {inc.area_name}
                        </span>
                        <GpsBadge status={inc.gps_status} />
                      </div>
                    </td>

                    {/* Assigned Responder */}
                    <td className="py-3.5 px-4 text-xs text-slate-600 max-w-[150px] truncate">
                      {inc.assigned_responder || 'Unassigned'}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={inc.status} />
                    </td>

                    {/* Link */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <Link
                        to={`/incidents/${inc.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 text-xs font-semibold transition-all"
                      >
                        <span>View</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
