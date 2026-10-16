import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import BarangayMap from '../components/map/BarangayMap';
import api from '../services/api';

export default function OfflineMapPage() {
  const [incidents, setIncidents] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);

  const fetchIncidents = async () => {
    try {
      const data = await api.incidents.getAll();
      if (data && data.incidents) {
        setIncidents(data.incidents);
      }
    } catch (err) {
      console.error('Error fetching map incidents:', err);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 5000);
    const handleReset = () => fetchIncidents();
    window.addEventListener('methore_data_reset', handleReset);
    return () => {
      clearInterval(interval);
      window.removeEventListener('methore_data_reset', handleReset);
    };
  }, []);

  // Filter incidents for display on the map
  const filteredIncidents = incidents.filter((inc) => {
    if (search && search.trim()) {
      const s = search.toLowerCase();
      const matchResident = (inc.resident_name || '').toLowerCase().includes(s);
      const matchCode = (inc.incident_code || '').toLowerCase().includes(s);
      const matchArea = (inc.area_name || '').toLowerCase().includes(s);
      if (!matchResident && !matchCode && !matchArea) return false;
    }

    if (selectedType !== 'all') {
      const t = (inc.emergency_type || '').toLowerCase();
      if (selectedType === 'traffic' && t !== 'traffic_accident' && t !== 'traffic') return false;
      if (selectedType !== 'traffic' && t !== selectedType) return false;
    }

    if (selectedStatus !== 'all' && (inc.status || '').toLowerCase() !== selectedStatus.toLowerCase()) {
      return false;
    }

    return true;
  });

  return (
    <div className="flex flex-col gap-4 w-full h-[calc(100vh-6.5rem)] animate-in fade-in duration-200">
      {/* 1. Clean Header Toolbar (Removed bloated multi-line subtitle) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Offline Barangay Map
          </h1>
        </div>
      </div>

      {/* 2. Map Filter Bar */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pin by code, resident, or area..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-slate-900 dark:focus:border-slate-400 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Quick Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer focus:border-slate-900 dark:focus:border-slate-400"
          >
            <option value="all">All Emergency Types</option>
            <option value="medical">Medical</option>
            <option value="fire">Fire</option>
            <option value="crime">Crime</option>
            <option value="traffic">Traffic Accident</option>
            <option value="disaster">Disaster</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer focus:border-slate-900 dark:focus:border-slate-400"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="responding">Responding</option>
            <option value="resolved">Resolved</option>
          </select>

          {(search || selectedType !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedType('all');
                setSelectedStatus('all');
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              type="button"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* 3. Realistic Satellite Map Viewport */}
      <div className="flex-1 w-full min-h-[480px]">
        <BarangayMap
          incidents={filteredIncidents}
          selectedIncidentId={selectedIncidentId}
          onSelectIncident={(inc) => setSelectedIncidentId(inc?.id || null)}
          onIncidentUpdated={fetchIncidents}
          height="100%"
          interactive={true}
          showControls={true}
        />
      </div>
    </div>
  );
}
