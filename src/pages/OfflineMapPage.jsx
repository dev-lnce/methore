import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Layers, 
  Flame, 
  Radio, 
  RefreshCw,
  Filter
} from 'lucide-react';
import BarangayMap from '../components/map/BarangayMap';

export default function OfflineMapPage() {
  const [incidents, setIncidents] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showMeshNodes, setShowMeshNodes] = useState(true);
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchIncidents = async () => {
    try {
      const res = await fetch('/api/incidents');
      if (res.ok) {
        const data = await res.json();
        setIncidents(data.incidents || []);
      }
    } catch (err) {
      console.error('Error fetching map incidents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 5000);
    return () => clearInterval(interval);
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
      const t = inc.emergency_type.toLowerCase();
      if (selectedType === 'traffic' && t !== 'traffic_accident' && t !== 'traffic') return false;
      if (selectedType !== 'traffic' && t !== selectedType) return false;
    }

    if (selectedStatus !== 'all' && inc.status.toLowerCase() !== selectedStatus.toLowerCase()) {
      return false;
    }

    return true;
  });

  return (
    <div className="flex flex-col gap-5 w-full h-[calc(100vh-6rem)] animate-in fade-in duration-200">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Offline Barangay Map
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Geographic Incident Distribution & Telemetry Mesh Overlay
          </p>
        </div>

        {/* Layer Toggles & Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Heatmap Overlay Toggle */}
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            type="button"
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all ${
              showHeatmap
                ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Heatmap Overlay {showHeatmap ? 'ON' : 'OFF'}</span>
          </button>

          {/* Mesh Nodes Layer Toggle */}
          <button
            onClick={() => setShowMeshNodes(!showMeshNodes)}
            type="button"
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all ${
              showMeshNodes
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mesh Nodes Layer</span>
          </button>
        </div>
      </div>

      {/* 2. Map Filter Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pin by code, resident, or area..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-slate-900 transition-all"
          />
        </div>

        {/* Quick Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none cursor-pointer"
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
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="responding">Responding</option>
            <option value="resolved">Resolved</option>
          </select>

          <span className="font-mono text-xs text-slate-500 whitespace-nowrap pl-2">
            Showing <strong>{filteredIncidents.length}</strong> markers
          </span>
        </div>
      </div>

      {/* 3. Full Map Canvas */}
      <div className="flex-1 min-h-[500px]">
        <BarangayMap
          incidents={filteredIncidents}
          showHeatmap={showHeatmap}
          showMeshNodes={showMeshNodes}
          selectedIncidentId={selectedIncidentId}
          onSelectIncident={(inc) => setSelectedIncidentId(inc.id)}
          height="100%"
          interactive={true}
        />
      </div>
    </div>
  );
}
