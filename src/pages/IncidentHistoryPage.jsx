import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Calendar, 
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';
import EmergencyBadge from '../components/common/EmergencyBadge';
import StatusBadge from '../components/common/StatusBadge';
import GpsBadge from '../components/common/GpsBadge';
import api from '../services/api';

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
      const data = await api.incidents.getAll({
        search,
        emergency_type: selectedType,
        status: selectedStatus,
        date_from: dateFrom,
        date_to: dateTo
      });
      if (data && data.incidents) {
        setIncidents(data.incidents);
      }
    } catch (err) {
      console.error('Error fetching incident history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    const handleReset = () => fetchHistory();
    window.addEventListener('methore_data_reset', handleReset);
    return () => window.removeEventListener('methore_data_reset', handleReset);
  }, [search, selectedType, selectedStatus, dateFrom, dateTo]);

  const exportUrl = api.incidents.getExportCsvUrl({
    search,
    emergency_type: selectedType,
    status: selectedStatus,
    date_from: dateFrom,
    date_to: dateTo
  });

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
      {/* 1. Clean Header Row with CSV Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Incident History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Historical archive of resolved incidents and dispatch records ({incidents.length} entries)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={exportUrl}
            download="methore_incidents_export.csv"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold shadow-sm transition-all border border-transparent dark:border-slate-700"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Archive (CSV)</span>
          </a>
        </div>
      </div>

      {/* 2. Unified Filter Toolbar Card */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-card flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code, citizen, area, notes..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-900 dark:focus:border-slate-400 outline-none transition-all shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Emergency Type Selector */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer focus:border-slate-900 dark:focus:border-slate-400"
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
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer focus:border-slate-900 dark:focus:border-slate-400"
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
              className="w-full py-2 px-3 rounded-2xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors border border-slate-200/60 dark:border-slate-800"
              type="button"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Date Range Row */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Date Filter:
          </span>
          <div className="flex items-center gap-2">
            <label className="text-slate-500">From:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-900 dark:text-slate-100 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-slate-500">To:</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-900 dark:text-slate-100 outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3. History Data Table */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm divide-y divide-slate-100 dark:divide-slate-800/70">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Code & Time</th>
                <th className="py-3 px-4">Emergency Type</th>
                <th className="py-3 px-4">Resident / Caller</th>
                <th className="py-3 px-4">Area & GPS</th>
                <th className="py-3 px-4">Assigned Responder</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 bg-white dark:bg-[#111827]">
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 dark:text-slate-500 font-mono text-xs">
                    {isLoading ? 'Loading incident archive...' : 'No historical records match your filters.'}
                  </td>
                </tr>
              ) : (
                incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Code & Time */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{inc.incident_code}</span>
                        <span className="text-[11px] text-slate-400">
                          {inc.report_time ? inc.report_time.slice(0, 10) : '2026-10-16'} •{' '}
                          {inc.receipt_time ? inc.receipt_time.slice(11, 16) : '--:--'}
                        </span>
                      </div>
                    </td>

                    {/* Emergency Type */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <EmergencyBadge type={inc.emergency_type} />
                    </td>

                    {/* Resident */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {inc.resident_name || (inc.is_registered_flag === 1 ? 'Registered Citizen' : 'Unknown Citizen')}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          {inc.user_id} ({inc.device_id})
                        </span>
                      </div>
                    </td>

                    {/* Location & GPS */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-800 dark:text-slate-200 font-medium text-xs truncate max-w-[200px]">
                          {inc.area_name}
                        </span>
                        <div>
                          <GpsBadge status={inc.gps_status} />
                        </div>
                      </div>
                    </td>

                    {/* Assigned Responder */}
                    <td className="py-3.5 px-4 text-xs text-slate-700 dark:text-slate-300">
                      {inc.assigned_responder || (
                        <span className="text-slate-400 dark:text-slate-500 italic">Unassigned</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={inc.status} />
                    </td>

                    {/* Details Link */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <Link
                        to={`/incidents/${inc.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-900 hover:text-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all border border-slate-200/60 dark:border-slate-700"
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
