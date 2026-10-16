import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Radio, 
  MapPin, 
  AlertTriangle, 
  Navigation, 
  Layers, 
  Flame, 
  HeartPulse, 
  ShieldAlert, 
  Car, 
  Waves, 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import EmergencyBadge from '../common/EmergencyBadge';
import StatusBadge from '../common/StatusBadge';
import GpsBadge from '../common/GpsBadge';

// Fixed offline bounding box for Barangay San Isidro
const MAP_BOUNDS = {
  minLat: 13.9780,
  maxLat: 13.9890,
  minLon: 121.0440,
  maxLon: 121.0580,
  viewWidth: 1000,
  viewHeight: 650
};

// Fixed offline infrastructure mesh nodes
const STATIC_MESH_NODES = [
  { id: 'STN-01', name: 'Barangay Hall Station', role: 'station', lat: 13.9840, lon: 121.0520, status: 'online' },
  { id: 'REL-01', name: 'Purok 2 Plaza Relay', role: 'relay', lat: 13.9845, lon: 121.0495, status: 'online' },
  { id: 'REL-02', name: 'Purok 4 School Tower', role: 'relay', lat: 13.9868, lon: 121.0545, status: 'online' },
  { id: 'REL-03', name: 'Boundary Hilltop Relay', role: 'relay', lat: 13.9880, lon: 121.0465, status: 'low_battery' },
  { id: 'REL-04', name: 'Riverside Outpost Relay', role: 'relay', lat: 13.9805, lon: 121.0480, status: 'offline' }
];

function projectCoords(lat, lon, width = MAP_BOUNDS.viewWidth, height = MAP_BOUNDS.viewHeight) {
  const normX = (lon - MAP_BOUNDS.minLon) / (MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon);
  const normY = (MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat);
  
  // clamp safely inside viewport
  const x = Math.max(40, Math.min(width - 40, normX * width));
  const y = Math.max(40, Math.min(height - 40, normY * height));
  return { x, y };
}

export default function BarangayMap({
  incidents = [],
  showHeatmap = false,
  showMeshNodes = true,
  selectedIncidentId = null,
  onSelectIncident = () => {},
  height = '620px',
  interactive = true
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [internalSelectedId, setInternalSelectedId] = useState(selectedIncidentId);

  const activeSelectedId = selectedIncidentId !== undefined ? selectedIncidentId : internalSelectedId;

  const selectedIncident = useMemo(() => {
    if (!activeSelectedId) return null;
    return incidents.find(i => String(i.id) === String(activeSelectedId) || i.incident_code === activeSelectedId);
  }, [incidents, activeSelectedId]);

  const handlePinClick = (inc) => {
    setInternalSelectedId(inc.id);
    onSelectIncident(inc);
  };

  return (
    <div className="relative w-full overflow-hidden bg-slate-50 border border-slate-200 rounded-3xl shadow-card select-none" style={{ height }}>
      {/* Zoom & Reset Controls */}
      {interactive && (
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.0))}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Zoom In"
            type="button"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.75))}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Zoom Out"
            type="button"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Reset Zoom"
            type="button"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Map SVG Canvas */}
      <svg
        viewBox={`0 0 ${MAP_BOUNDS.viewWidth} ${MAP_BOUNDS.viewHeight}`}
        className="w-full h-full object-cover transition-transform duration-300 ease-out"
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'center center'
        }}
      >
        <defs>
          {/* Subtle grid pattern */}
          <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E2E8F0" strokeWidth="0.8" opacity="0.6" />
          </pattern>

          {/* Radial gradients for offline heatmap visualization */}
          <radialGradient id="heat-red" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.65" />
            <stop offset="40%" stopColor="#F97316" stopOpacity="0.35" />
            <stop offset="75%" stopColor="#FBBF24" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="heat-orange" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F97316" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#FBBF24" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Base Background Ground */}
        <rect width="100%" height="100%" fill="#F8FAFC" />
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />

        {/* 1. Neighborhood Parcels & Land Use */}
        <g id="land-parcels" className="opacity-90">
          {/* Purok 1 North Sector */}
          <rect x="80" y="50" width="220" height="150" rx="16" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1" />
          <text x="190" y="75" textAnchor="middle" fill="#64748B" fontFamily="Plus Jakarta Sans" fontSize="12" fontWeight="600">PUROK 1 • NORTH</text>

          {/* Purok 2 Plaza & Central Zone */}
          <rect x="330" y="60" width="280" height="180" rx="16" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1" />
          <text x="470" y="85" textAnchor="middle" fill="#64748B" fontFamily="Plus Jakarta Sans" fontSize="12" fontWeight="600">PUROK 2 • POBLACION</text>

          {/* Purok 2 Plaza Park (Greenspace) */}
          <rect x="370" y="105" width="200" height="70" rx="12" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="1.5" />
          <text x="470" y="145" textAnchor="middle" fill="#059669" fontFamily="Plus Jakarta Sans" fontSize="11" fontWeight="700">SAN ISIDRO PLAZA</text>

          {/* Purok 3 Market Zone */}
          <rect x="640" y="70" width="280" height="190" rx="16" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1" />
          <text x="780" y="95" textAnchor="middle" fill="#64748B" fontFamily="Plus Jakarta Sans" fontSize="12" fontWeight="600">PUROK 3 • COMMERCIAL</text>

          {/* Public Market Building */}
          <rect x="680" y="115" width="180" height="70" rx="10" fill="#FEF3C7" stroke="#FDE68A" strokeWidth="1" />
          <text x="770" y="155" textAnchor="middle" fill="#B45309" fontFamily="Plus Jakarta Sans" fontSize="11" fontWeight="600">PUBLIC MARKET STALLS</text>

          {/* Purok 4 School & Educational Compound */}
          <rect x="120" y="270" width="340" height="230" rx="16" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1" />
          <text x="290" y="300" textAnchor="middle" fill="#64748B" fontFamily="Plus Jakarta Sans" fontSize="12" fontWeight="600">PUROK 4 • ELEMENTARY SCHOOL</text>

          {/* Elementary School Ground */}
          <rect x="150" y="325" width="220" height="110" rx="12" fill="#E0F2FE" stroke="#BAE6FD" strokeWidth="1" />
          <text x="260" y="380" textAnchor="middle" fill="#0369A1" fontFamily="Plus Jakarta Sans" fontSize="11" fontWeight="600">SAN ISIDRO ELEM. SCHOOL</text>

          {/* Purok 5 Riverside & Boundary Post */}
          <rect x="520" y="290" width="400" height="230" rx="16" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1" />
          <text x="720" y="320" textAnchor="middle" fill="#64748B" fontFamily="Plus Jakarta Sans" fontSize="12" fontWeight="600">PUROK 5 • RIVERSIDE POST</text>

          {/* San Isidro River Canal */}
          <path d="M 520 480 Q 700 450 980 500" fill="none" stroke="#BAE6FD" strokeWidth="24" strokeLinecap="round" />
          <path d="M 520 480 Q 700 450 980 500" fill="none" stroke="#0284C7" strokeWidth="2" strokeDasharray="6 4" opacity="0.4" />
          <text x="760" y="475" textAnchor="middle" fill="#0284C7" fontFamily="JetBrains Mono" fontSize="10" fontWeight="600" letterSpacing="0.08em">RIVER BOUNDARY</text>
        </g>

        {/* 2. Primary Street Arteries */}
        <g id="street-network">
          {/* Rizal Avenue (Horizontal main arterial) */}
          <path d="M 40 250 L 960 250" stroke="#FFFFFF" strokeWidth="28" strokeLinecap="round" />
          <path d="M 40 250 L 960 250" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="8 6" />
          <text x="80" y="246" fill="#64748B" fontFamily="JetBrains Mono" fontSize="11" fontWeight="600">RIZAL AVENUE</text>

          {/* Mabini Street (Vertical arterial) */}
          <path d="M 320 40 L 320 580" stroke="#FFFFFF" strokeWidth="24" strokeLinecap="round" />
          <path d="M 320 40 L 320 580" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="8 6" />
          <text x="312" y="160" transform="rotate(-90 312 160)" fill="#64748B" fontFamily="JetBrains Mono" fontSize="10" fontWeight="600">MABINI STREET</text>

          {/* Bonifacio Street (North-South Connector) */}
          <path d="M 630 40 L 630 580" stroke="#FFFFFF" strokeWidth="22" strokeLinecap="round" />
          <path d="M 630 40 L 630 580" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="8 6" />
          <text x="622" y="160" transform="rotate(-90 622 160)" fill="#64748B" fontFamily="JetBrains Mono" fontSize="10" fontWeight="600">BONIFACIO STREET</text>

          {/* San Isidro Way (Loop road) */}
          <path d="M 120 520 L 880 520" stroke="#FFFFFF" strokeWidth="20" strokeLinecap="round" />
          <path d="M 120 520 L 880 520" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="6 4" />
          <text x="180" y="516" fill="#64748B" fontFamily="JetBrains Mono" fontSize="10" fontWeight="600">SAN ISIDRO WAY</text>
        </g>

        {/* 3. Offline Heatmap Density Clusters (Toggleable) */}
        {showHeatmap && (
          <g id="heatmap-layer" className="transition-opacity duration-300 pointer-events-none">
            {incidents.map((inc) => {
              const { x, y } = projectCoords(inc.latitude, inc.longitude);
              const isUrgent = inc.emergency_type === 'medical' || inc.emergency_type === 'fire';
              const radius = isUrgent ? 110 : 80;
              return (
                <circle
                  key={`heat-${inc.id}`}
                  cx={x}
                  cy={y}
                  r={radius}
                  fill={isUrgent ? 'url(#heat-red)' : 'url(#heat-orange)'}
                />
              );
            })}
          </g>
        )}

        {/* 4. Mesh Network Infrastructure Nodes & RF Hop Links (Toggleable) */}
        {showMeshNodes && (
          <g id="mesh-nodes-layer">
            {/* Dashed RF Hop Lines from Relay Nodes to Gateway Station */}
            <path d="M 390 190 Q 480 150 560 210" fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="6 4" opacity="0.75" />
            <path d="M 720 180 Q 640 160 560 210" fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="6 4" opacity="0.75" />
            <path d="M 240 120 Q 380 90 560 210" fill="none" stroke="#10B981" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6" />
            <path d="M 450 420 Q 510 320 560 210" fill="none" stroke="#10B981" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6" />

            {/* Static Node Markers */}
            {STATIC_MESH_NODES.map((node) => {
              const { x, y } = projectCoords(node.lat, node.lon);
              const isStation = node.role === 'station';
              const isOnline = node.status === 'online';

              return (
                <g key={node.id} transform={`translate(${x}, ${y})`}>
                  {/* Pulse ring for active station */}
                  {isStation && (
                    <circle r="22" fill="#10B981" fillOpacity="0.12">
                      <animate attributeName="r" values="18;28;18" dur="2.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;0.1;0.6" dur="2.5s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Outer circle */}
                  <circle
                    r={isStation ? 12 : 9}
                    fill={isStation ? '#0F172A' : '#1E293B'}
                    stroke={isOnline ? '#10B981' : '#94A3B8'}
                    strokeWidth="2.5"
                  />

                  {/* Center Dot */}
                  <circle r={isStation ? 4 : 3} fill={isOnline ? '#10B981' : '#E2E8F0'} />

                  {/* Label Badge */}
                  <rect
                    x="-65"
                    y={isStation ? "-34" : "14"}
                    width="130"
                    height="20"
                    rx="10"
                    fill="#FFFFFF"
                    stroke="#E2E8F0"
                    strokeWidth="1"
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))"
                  />
                  <text
                    x="0"
                    y={isStation ? "-20" : "28"}
                    textAnchor="middle"
                    fill="#0F172A"
                    fontFamily="JetBrains Mono"
                    fontSize="9.5"
                    fontWeight="600"
                  >
                    {isStation ? '★ STN-01 Base Station' : node.id}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* 5. Live Incident Pins */}
        <g id="incident-pins">
          {incidents.map((inc) => {
            const { x, y } = projectCoords(inc.latitude, inc.longitude);
            const isSelected = String(inc.id) === String(activeSelectedId) || inc.incident_code === activeSelectedId;
            const isStaleGps = inc.gps_status === 'stale' || inc.gps_status === 'unavailable';
            const isNew = inc.status === 'New';

            // Emergency category colors
            let pinColor = '#EF4444'; // default red for medical
            let innerFill = '#DC2626';
            if (inc.emergency_type === 'fire') {
              pinColor = '#EA580C';
              innerFill = '#F97316';
            } else if (inc.emergency_type === 'crime') {
              pinColor = '#7C3AED';
              innerFill = '#9333EA';
            } else if (inc.emergency_type === 'traffic_accident' || inc.emergency_type === 'traffic') {
              pinColor = '#D97706';
              innerFill = '#F59E0B';
            } else if (inc.emergency_type === 'disaster') {
              pinColor = '#0D9488';
              innerFill = '#14B8A6';
            }

            return (
              <g
                key={inc.id}
                transform={`translate(${x}, ${y})`}
                className="cursor-pointer transition-transform hover:scale-125"
                onClick={() => handlePinClick(inc)}
              >
                {/* Stale / Missing GPS Dashed Alert Rings (Rule requirement) */}
                {isStaleGps && (
                  <circle
                    r="24"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    className="animate-spin"
                    style={{ transformOrigin: '0 0', animationDuration: '8s' }}
                  />
                )}

                {/* New Urgent Incident Ping Wave */}
                {isNew && !isStaleGps && (
                  <circle r="20" fill={pinColor} fillOpacity="0.25">
                    <animate attributeName="r" values="14;24;14" dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.7;0.1;0.7" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Outer halo when selected */}
                {isSelected && (
                  <circle r="20" fill="none" stroke="#0F172A" strokeWidth="2.5" />
                )}

                {/* Main Pin Body */}
                <circle
                  r={isSelected ? 14 : 11}
                  fill={innerFill}
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  filter="drop-shadow(0 3px 6px rgba(0,0,0,0.2))"
                />

                {/* Inner White Marker Center */}
                <circle r={isSelected ? 5 : 4} fill="#FFFFFF" />

                {/* Incident Code Badge */}
                <rect
                  x="-42"
                  y="-28"
                  width="84"
                  height="18"
                  rx="9"
                  fill="#0F172A"
                  stroke="#FFFFFF"
                  strokeWidth="1"
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
                />
                <text
                  x="0"
                  y="-16"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontFamily="JetBrains Mono"
                  fontSize="9"
                  fontWeight="600"
                >
                  {inc.incident_code}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Floating Selected Incident Preview Card */}
      {selectedIncident && (
        <div className="absolute bottom-5 left-5 right-5 sm:right-auto sm:w-[380px] z-30 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200 shadow-modal animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                {selectedIncident.incident_code}
              </span>
              <EmergencyBadge type={selectedIncident.emergency_type} />
            </div>
            <button
              onClick={() => setInternalSelectedId(null)}
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded-lg transition-colors"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900">
                {selectedIncident.resident_name || (selectedIncident.is_registered_flag === 1 ? 'Registered Citizen' : 'Unknown Resident')}
              </span>
              <StatusBadge status={selectedIncident.status} />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{selectedIncident.area_name}</span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <GpsBadge status={selectedIncident.gps_status} />
              <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {selectedIncident.hop_count} {selectedIncident.hop_count === 1 ? 'hop' : 'hops'} ({selectedIncident.rssi} dBm)
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <Link
              to={`/incidents/${selectedIncident.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              <span>Open Full Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Offline Watermark Badge */}
      <div className="absolute bottom-3 right-3 pointer-events-none z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-500 font-mono text-[10px]">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span>Offline Local SVG Engine • Zero External CDN Tiles</span>
      </div>
    </div>
  );
}
