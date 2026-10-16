import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Radio, 
  MapPin, 
  Layers, 
  Flame, 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  ArrowRight,
  CheckCircle,
  Eye,
  Activity,
  Compass
} from 'lucide-react';
import EmergencyBadge from '../common/EmergencyBadge';
import StatusBadge from '../common/StatusBadge';
import GpsBadge from '../common/GpsBadge';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useAudioAlert } from '../../context/AudioAlertContext';

// High-precision bounding box for Barangay San Isidro (Lipa City / Batangas corridor)
// Center: 13.9412° N, 121.1624° E
const MAP_BOUNDS = {
  minLat: 13.9330,
  maxLat: 13.9495,
  minLon: 121.1530,
  maxLon: 121.1710,
  viewWidth: 1000,
  viewHeight: 650
};

// Fixed LoRa Mesh Nodes in Barangay San Isidro
const STATIC_MESH_NODES = [
  { id: 'STN-01', name: 'Barangay Hall Station', role: 'station', lat: 13.9412, lon: 121.1624, status: 'online' },
  { id: 'REL-01', name: 'Purok 2 Plaza Relay', role: 'relay', lat: 13.9425, lon: 121.1600, status: 'online' },
  { id: 'REL-02', name: 'Purok 4 School Tower', role: 'relay', lat: 13.9448, lon: 121.1645, status: 'online' },
  { id: 'REL-03', name: 'Boundary Hilltop Relay', role: 'relay', lat: 13.9470, lon: 121.1668, status: 'online' },
  { id: 'REL-04', name: 'Riverside Outpost Relay', role: 'relay', lat: 13.9385, lon: 121.1585, status: 'low_battery' },
  { id: 'REL-05', name: 'North Ridge Solar Relay', role: 'relay', lat: 13.9490, lon: 121.1550, status: 'offline' }
];

function projectCoords(lat, lon, width = MAP_BOUNDS.viewWidth, height = MAP_BOUNDS.viewHeight) {
  const normX = (lon - MAP_BOUNDS.minLon) / (MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon);
  const normY = (MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat);
  
  const x = Math.max(35, Math.min(width - 35, normX * width));
  const y = Math.max(35, Math.min(height - 35, normY * height));
  return { x, y };
}

export default function BarangayMap({
  incidents = [],
  showHeatmap: initialHeatmap = false,
  showMeshNodes: initialMeshNodes = true,
  selectedIncidentId = null,
  onSelectIncident = () => {},
  onIncidentUpdated = () => {},
  height = '620px',
  interactive = true,
  showControls = true
}) {
  const { user } = useAuth();
  const { triggerAck } = useAudioAlert();

  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapStyle, setMapStyle] = useState('satellite'); // 'satellite' | 'hybrid'
  const [showHeatmap, setShowHeatmap] = useState(initialHeatmap);
  const [showMeshNodes, setShowMeshNodes] = useState(initialMeshNodes);
  const [internalSelectedId, setInternalSelectedId] = useState(selectedIncidentId);
  const [tileError, setTileError] = useState(false);
  const [isAcknowledging, setIsAcknowledging] = useState(false);

  const activeSelectedId = selectedIncidentId !== null && selectedIncidentId !== undefined 
    ? selectedIncidentId 
    : internalSelectedId;

  const selectedIncident = useMemo(() => {
    if (!activeSelectedId) return null;
    return incidents.find(i => String(i.id) === String(activeSelectedId) || i.incident_code === activeSelectedId);
  }, [incidents, activeSelectedId]);

  const handlePinClick = (inc) => {
    setInternalSelectedId(inc.id);
    onSelectIncident(inc);
  };

  const handleQuickAcknowledge = async (e, inc) => {
    e.stopPropagation();
    if (!inc) return;
    setIsAcknowledging(true);
    triggerAck();

    try {
      await api.incidents.updateStatus(inc.id, {
        status: 'Acknowledged',
        changed_by_name: user?.full_name || 'Alex Rivera',
        changed_by_role: user?.role || 'official',
        note: 'Direct satellite map preview acknowledgment'
      });
      onIncidentUpdated();
    } catch (err) {
      console.error('Failed to acknowledge incident from map:', err);
    } finally {
      setIsAcknowledging(false);
    }
  };

  // Node positions for cyan RF mesh lines
  const stationCoords = projectCoords(13.9412, 121.1624);
  const rel1Coords = projectCoords(13.9425, 121.1600);
  const rel2Coords = projectCoords(13.9448, 121.1645);
  const rel3Coords = projectCoords(13.9470, 121.1668);
  const rel4Coords = projectCoords(13.9385, 121.1585);
  const rel5Coords = projectCoords(13.9490, 121.1550);

  return (
    <div 
      className="relative w-full overflow-hidden bg-[#0A1016] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-card select-none" 
      style={{ height }}
    >
      {/* 1. Map Style & Layer Switcher Bar (Top Left) */}
      {showControls && (
        <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
          {/* Map Style Switcher (Satellite | Hybrid Labels) */}
          <div className="inline-flex items-center p-1 rounded-2xl bg-slate-900/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-md">
            <button
              type="button"
              onClick={() => setMapStyle('satellite')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                mapStyle === 'satellite'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Satellite [Default]
            </button>
            <button
              type="button"
              onClick={() => setMapStyle('hybrid')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                mapStyle === 'hybrid'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Hybrid Labels
            </button>
          </div>

          {/* Heatmap Toggle Pill */}
          <button
            type="button"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold backdrop-blur-md border transition-all shadow-md ${
              showHeatmap
                ? 'bg-rose-500 text-white border-rose-400 shadow-rose-900/30'
                : 'bg-slate-900/90 text-slate-300 border-slate-700/80 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Heatmap Overlay {showHeatmap ? 'ON' : 'OFF'}</span>
          </button>

          {/* Mesh Nodes Layer Toggle Pill */}
          <button
            type="button"
            onClick={() => setShowMeshNodes(!showMeshNodes)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold backdrop-blur-md border transition-all shadow-md ${
              showMeshNodes
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-cyan-900/30'
                : 'bg-slate-900/90 text-slate-300 border-slate-700/80 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-cyan-300" />
            <span>Mesh Nodes Layer</span>
          </button>
        </div>
      )}

      {/* 2. Zoom & Reset Controls (Top Right) */}
      {interactive && (
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-md">
          <button
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.25))}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
            title="Zoom In"
            type="button"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.75))}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
            title="Zoom Out"
            type="button"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
            title="Reset Zoom"
            type="button"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. True Satellite Aerial Canvas with Procedural + Tile Layer */}
      <div 
        className="w-full h-full relative overflow-hidden transition-transform duration-300 ease-out"
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'center center'
        }}
      >
        {/* Esri World Imagery Satellite Tiles Overlay (Live aerial imagery) */}
        {!tileError && (
          <div className="absolute inset-0 w-full h-full pointer-events-none opacity-85 mix-blend-screen">
            <img
              src="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=121.1530,13.9330,121.1710,13.9495&bboxSR=4326&imageSR=4326&size=1000,650&format=png&f=image"
              alt="Barangay San Isidro Satellite Aerial"
              className="w-full h-full object-cover"
              onError={() => setTileError(true)}
            />
          </div>
        )}

        {/* SVG Vector Overlays */}
        <svg
          viewBox={`0 0 ${MAP_BOUNDS.viewWidth} ${MAP_BOUNDS.viewHeight}`}
          className="absolute inset-0 w-full h-full pointer-events-auto"
        >
          <defs>
            {/* Rich procedural satellite aerial texture patterns (Fallback & Accent) */}
            <radialGradient id="foliage-grad-1" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#1e3a24" />
              <stop offset="50%" stopColor="#152b1b" />
              <stop offset="100%" stopColor="#0d1b11" />
            </radialGradient>

            <radialGradient id="foliage-grad-2" cx="60%" cy="50%" r="65%">
              <stop offset="0%" stopColor="#254329" />
              <stop offset="60%" stopColor="#18311d" />
              <stop offset="100%" stopColor="#0f1f13" />
            </radialGradient>

            {/* Satellite Grid pattern */}
            <pattern id="satellite-sensor-grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#22D3EE" strokeWidth="0.5" opacity="0.12" />
            </pattern>

            {/* Thermal heat gradients */}
            <radialGradient id="heat-thermal-red" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.8" />
              <stop offset="35%" stopColor="#F97316" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#FBBF24" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="heat-thermal-orange" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F97316" stopOpacity="0.75" />
              <stop offset="40%" stopColor="#FBBF24" stopOpacity="0.45" />
              <stop offset="80%" stopColor="#10B981" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </radialGradient>

            {/* Cyan RF glow filter */}
            <filter id="cyan-mesh-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#22D3EE" floodOpacity="0.8" />
            </filter>

            {/* Drop shadow for text labels */}
            <filter id="label-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000000" floodOpacity="0.9" />
            </filter>
          </defs>

          {/* BASE PROCEDURAL SATELLITE TERRAIN (Lush tropical foliage, farmland, river, rooftops) */}
          <rect width="100%" height="100%" fill="#0D1612" />
          <rect width="100%" height="100%" fill="url(#foliage-grad-1)" opacity="0.9" />
          <rect width="100%" height="100%" fill="url(#satellite-sensor-grid)" />

          {/* Canopy Texture Clusters */}
          <g id="terrain-foliage-canopy" opacity="0.75">
            <ellipse cx="220" cy="180" rx="190" ry="140" fill="url(#foliage-grad-2)" />
            <ellipse cx="780" cy="190" rx="200" ry="150" fill="url(#foliage-grad-2)" />
            <ellipse cx="320" cy="480" rx="260" ry="160" fill="url(#foliage-grad-2)" />
            <ellipse cx="800" cy="490" rx="220" ry="150" fill="url(#foliage-grad-2)" />
          </g>

          {/* River Canal Stream */}
          <g id="river-canal" opacity="0.85">
            <path d="M 0 540 Q 250 490 500 520 T 1000 480" fill="none" stroke="#08202E" strokeWidth="28" strokeLinecap="round" />
            <path d="M 0 540 Q 250 490 500 520 T 1000 480" fill="none" stroke="#0EA5E9" strokeWidth="8" strokeOpacity="0.6" />
            <path d="M 0 540 Q 250 490 500 520 T 1000 480" fill="none" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="8 6" strokeOpacity="0.8" />
            <text x="350" y="505" fill="#38BDF8" fontFamily="JetBrains Mono" fontSize="9" fontWeight="700" letterSpacing="0.1em" filter="url(#label-glow)">
              SAN ISIDRO RIVERWAY
            </text>
          </g>

          {/* Residential Rooftops & Building Blocks (Real aerial clustering) */}
          <g id="satellite-rooftops" opacity="0.65">
            {/* Purok 1 North Sector */}
            <rect x="120" y="70" width="35" height="24" rx="2" fill="#5F6F7E" />
            <rect x="165" y="75" width="28" height="20" rx="2" fill="#7C4A3A" />
            <rect x="200" y="65" width="40" height="26" rx="2" fill="#4B5868" />
            <rect x="135" y="105" width="30" height="22" rx="2" fill="#8B5746" />
            <rect x="175" y="110" width="45" height="25" rx="2" fill="#627485" />

            {/* Purok 2 Poblacion Plaza Center */}
            <rect x="420" y="140" width="55" height="36" rx="3" fill="#8A4E3D" stroke="#000" strokeWidth="0.5" />
            <rect x="485" y="145" width="48" height="30" rx="3" fill="#4E5D6C" />
            <rect x="430" y="185" width="40" height="28" rx="2" fill="#64748B" />
            <rect x="480" y="182" width="60" height="35" rx="3" fill="#935745" />

            {/* Purok 3 Market Stalls */}
            <rect x="680" y="110" width="70" height="40" rx="3" fill="#B45309" stroke="#000" strokeWidth="0.5" />
            <rect x="760" y="115" width="65" height="38" rx="3" fill="#78350F" />
            <rect x="690" y="160" width="55" height="30" rx="2" fill="#526372" />
            <rect x="755" y="162" width="70" height="32" rx="2" fill="#804A3B" />

            {/* Purok 4 Elementary School Compound */}
            <rect x="220" y="270" width="90" height="42" rx="3" fill="#1E3A8A" stroke="#38BDF8" strokeWidth="0.8" />
            <rect x="320" y="275" width="75" height="38" rx="3" fill="#1E40AF" />
            <rect x="235" y="325" width="80" height="35" rx="2" fill="#475569" />

            {/* Purok 5 & 6 Outlying Structures */}
            <rect x="720" y="320" width="45" height="28" rx="2" fill="#6C7C8C" />
            <rect x="780" y="325" width="52" height="32" rx="2" fill="#884C3C" />
            <rect x="690" y="370" width="40" height="25" rx="2" fill="#5A6A7A" />
            <rect x="745" y="365" width="60" height="36" rx="2" fill="#9C5D4B" />
          </g>

          {/* SATELLITE ROAD NETWORK (High-contrast asphalt with dark casing) */}
          <g id="road-network">
            {/* Primary East-West Arterial: Rizal Avenue */}
            <path d="M 0 240 L 1000 240" stroke="#050B10" strokeWidth="26" strokeLinecap="round" />
            <path d="M 0 240 L 1000 240" stroke="#1E293B" strokeWidth="20" strokeLinecap="round" />
            <path d="M 0 240 L 1000 240" stroke="#F8FAFC" strokeWidth="1.5" strokeDasharray="10 8" strokeOpacity="0.75" />

            {/* North-South Arterial: Mabini Street */}
            <path d="M 370 0 L 370 650" stroke="#050B10" strokeWidth="22" strokeLinecap="round" />
            <path d="M 370 0 L 370 650" stroke="#1E293B" strokeWidth="16" strokeLinecap="round" />
            <path d="M 370 0 L 370 650" stroke="#F8FAFC" strokeWidth="1.2" strokeDasharray="8 6" strokeOpacity="0.75" />

            {/* North-South Connector: Bonifacio Street */}
            <path d="M 640 0 L 640 650" stroke="#050B10" strokeWidth="20" strokeLinecap="round" />
            <path d="M 640 0 L 640 650" stroke="#1E293B" strokeWidth="14" strokeLinecap="round" />
            <path d="M 640 0 L 640 650" stroke="#F8FAFC" strokeWidth="1.2" strokeDasharray="8 6" strokeOpacity="0.7" />

            {/* Loop Arterial: San Isidro Way */}
            <path d="M 100 440 Q 500 460 900 430" stroke="#050B10" strokeWidth="18" strokeLinecap="round" />
            <path d="M 100 440 Q 500 460 900 430" stroke="#1E293B" strokeWidth="12" strokeLinecap="round" />
            <path d="M 100 440 Q 500 460 900 430" stroke="#F8FAFC" strokeWidth="1" strokeDasharray="6 6" strokeOpacity="0.65" />
          </g>

          {/* PUROK ZONE BOUNDARIES (Purok 1 through Purok 6 with high-contrast outlines) */}
          <g id="purok-boundaries">
            {/* Purok 1 North */}
            <path d="M 50 30 L 350 30 L 350 220 L 50 220 Z" fill="#22D3EE" fillOpacity="0.04" stroke="#22D3EE" strokeWidth="1.5" strokeDasharray="6 4" strokeOpacity="0.5" />
            
            {/* Purok 2 Poblacion Plaza */}
            <path d="M 390 30 L 620 30 L 620 220 L 390 220 Z" fill="#10B981" fillOpacity="0.05" stroke="#10B981" strokeWidth="1.5" strokeDasharray="6 4" strokeOpacity="0.55" />

            {/* Purok 3 Commercial Market */}
            <path d="M 660 30 L 960 30 L 960 220 L 660 220 Z" fill="#F59E0B" fillOpacity="0.04" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="6 4" strokeOpacity="0.5" />

            {/* Purok 4 Elementary School Sector */}
            <path d="M 50 260 L 350 260 L 350 490 L 50 490 Z" fill="#3B82F6" fillOpacity="0.04" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="6 4" strokeOpacity="0.5" />

            {/* Purok 5 Riverside Outpost */}
            <path d="M 390 260 L 620 260 L 620 490 L 390 490 Z" fill="#14B8A6" fillOpacity="0.05" stroke="#14B8A6" strokeWidth="1.5" strokeDasharray="6 4" strokeOpacity="0.5" />

            {/* Purok 6 Highway Corridor */}
            <path d="M 660 260 L 960 260 L 960 490 L 660 490 Z" fill="#A855F7" fillOpacity="0.04" stroke="#A855F7" strokeWidth="1.5" strokeDasharray="6 4" strokeOpacity="0.5" />
          </g>

          {/* HIGH-CONTRAST STREET & PUROK LABELS (With dark halos for satellite readability) */}
          <g id="street-and-zone-labels">
            {/* Purok Labels */}
            <text x="200" y="55" textAnchor="middle" fill="#FFFFFF" fontFamily="Plus Jakarta Sans" fontSize="11" fontWeight="700" letterSpacing="0.08em" filter="url(#label-glow)">
              PUROK 1 • NORTH
            </text>
            <text x="505" y="55" textAnchor="middle" fill="#FFFFFF" fontFamily="Plus Jakarta Sans" fontSize="11" fontWeight="700" letterSpacing="0.08em" filter="url(#label-glow)">
              PUROK 2 • POBLACION
            </text>
            <text x="810" y="55" textAnchor="middle" fill="#FFFFFF" fontFamily="Plus Jakarta Sans" fontSize="11" fontWeight="700" letterSpacing="0.08em" filter="url(#label-glow)">
              PUROK 3 • COMMERCIAL
            </text>
            <text x="200" y="285" textAnchor="middle" fill="#FFFFFF" fontFamily="Plus Jakarta Sans" fontSize="11" fontWeight="700" letterSpacing="0.08em" filter="url(#label-glow)">
              PUROK 4 • SCHOOL
            </text>
            <text x="505" y="285" textAnchor="middle" fill="#FFFFFF" fontFamily="Plus Jakarta Sans" fontSize="11" fontWeight="700" letterSpacing="0.08em" filter="url(#label-glow)">
              PUROK 5 • RIVERSIDE
            </text>
            <text x="810" y="285" textAnchor="middle" fill="#FFFFFF" fontFamily="Plus Jakarta Sans" fontSize="11" fontWeight="700" letterSpacing="0.08em" filter="url(#label-glow)">
              PUROK 6 • HIGHWAY
            </text>

            {/* Street Names (with dark stroke halo for extreme readability) */}
            <text x="90" y="235" fill="#E2E8F0" fontFamily="JetBrains Mono" fontSize="10" fontWeight="700" letterSpacing="0.08em" filter="url(#label-glow)">
              RIZAL AVENUE
            </text>
            <text x="362" y="160" transform="rotate(-90 362 160)" fill="#E2E8F0" fontFamily="JetBrains Mono" fontSize="10" fontWeight="700" letterSpacing="0.08em" filter="url(#label-glow)">
              MABINI STREET
            </text>
            <text x="632" y="160" transform="rotate(-90 632 160)" fill="#E2E8F0" fontFamily="JetBrains Mono" fontSize="10" fontWeight="700" letterSpacing="0.08em" filter="url(#label-glow)">
              BONIFACIO STREET
            </text>
            <text x="180" y="435" fill="#E2E8F0" fontFamily="JetBrains Mono" fontSize="10" fontWeight="700" letterSpacing="0.08em" filter="url(#label-glow)">
              SAN ISIDRO WAY
            </text>

            {/* Hybrid Labels: Landmarks */}
            {mapStyle === 'hybrid' && (
              <g id="hybrid-landmarks" className="animate-in fade-in duration-200">
                <rect x="440" y="85" width="130" height="20" rx="10" fill="#0F172A" stroke="#10B981" strokeWidth="1" filter="url(#label-glow)" />
                <text x="505" y="99" textAnchor="middle" fill="#E2E8F0" fontFamily="Plus Jakarta Sans" fontSize="9.5" fontWeight="600">
                  ★ SAN ISIDRO PLAZA
                </text>

                <rect x="685" y="85" width="135" height="20" rx="10" fill="#0F172A" stroke="#F59E0B" strokeWidth="1" filter="url(#label-glow)" />
                <text x="752" y="99" textAnchor="middle" fill="#E2E8F0" fontFamily="Plus Jakarta Sans" fontSize="9.5" fontWeight="600">
                  PUBLIC MARKET STALLS
                </text>

                <rect x="185" y="375" width="150" height="20" rx="10" fill="#0F172A" stroke="#38BDF8" strokeWidth="1" filter="url(#label-glow)" />
                <text x="260" y="389" textAnchor="middle" fill="#E2E8F0" fontFamily="Plus Jakarta Sans" fontSize="9.5" fontWeight="600">
                  SAN ISIDRO ELEM. SCHOOL
                </text>
              </g>
            )}
          </g>

          {/* HEATMAP DENSITY CLUSTERS (Smooth radial thermal gradient) */}
          {showHeatmap && (
            <g id="thermal-heatmap-overlay" className="pointer-events-none transition-opacity duration-300">
              {incidents.map((inc) => {
                const { x, y } = projectCoords(inc.latitude, inc.longitude);
                const isUrgent = inc.emergency_type === 'medical' || inc.emergency_type === 'fire';
                const r = isUrgent ? 130 : 95;
                return (
                  <circle
                    key={`heat-${inc.id}`}
                    cx={x}
                    cy={y}
                    r={r}
                    fill={isUrgent ? 'url(#heat-thermal-red)' : 'url(#heat-thermal-orange)'}
                  />
                );
              })}
            </g>
          )}

          {/* MESH NODES & DASHED CYAN RF HOP LINES */}
          {showMeshNodes && (
            <g id="mesh-nodes-layer">
              {/* Dashed Cyan Hop Path Lines Connecting Relay Nodes to Receiving Station */}
              <g filter="url(#cyan-mesh-glow)">
                {/* REL-01 to STN-01 */}
                <path d={`M ${rel1Coords.x} ${rel1Coords.y} Q 450 200 ${stationCoords.x} ${stationCoords.y}`} fill="none" stroke="#22D3EE" strokeWidth="2.5" strokeDasharray="6 4" strokeOpacity="0.85" />
                {/* REL-02 to STN-01 */}
                <path d={`M ${rel2Coords.x} ${rel2Coords.y} Q 580 180 ${stationCoords.x} ${stationCoords.y}`} fill="none" stroke="#22D3EE" strokeWidth="2.5" strokeDasharray="6 4" strokeOpacity="0.85" />
                {/* REL-03 to REL-02 */}
                <path d={`M ${rel3Coords.x} ${rel3Coords.y} Q 680 150 ${rel2Coords.x} ${rel2Coords.y}`} fill="none" stroke="#22D3EE" strokeWidth="2" strokeDasharray="6 4" strokeOpacity="0.7" />
                {/* REL-04 to REL-01 */}
                <path d={`M ${rel4Coords.x} ${rel4Coords.y} Q 400 360 ${rel1Coords.x} ${rel1Coords.y}`} fill="none" stroke="#22D3EE" strokeWidth="2" strokeDasharray="6 4" strokeOpacity="0.7" />
                {/* REL-05 to REL-01 */}
                <path d={`M ${rel5Coords.x} ${rel5Coords.y} Q 280 80 ${rel1Coords.x} ${rel1Coords.y}`} fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 4" strokeOpacity="0.4" />
              </g>

              {/* Static Mesh Node Markers */}
              {STATIC_MESH_NODES.map((node) => {
                const { x, y } = projectCoords(node.lat, node.lon);
                const isStation = node.role === 'station';
                const isOnline = node.status === 'online';
                const isLow = node.status === 'low_battery';

                return (
                  <g key={node.id} transform={`translate(${x}, ${y})`}>
                    {/* Pulsing Radar Ring for Base Receiving Station */}
                    {isStation && (
                      <circle r="30" fill="#22D3EE" fillOpacity="0.15">
                        <animate attributeName="r" values="16;38;16" dur="2.4s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0.1;0.8" dur="2.4s" repeatCount="indefinite" />
                      </circle>
                    )}

                    {/* Outer Circle */}
                    <circle
                      r={isStation ? 14 : 9}
                      fill={isStation ? '#0F172A' : '#1E293B'}
                      stroke={isStation ? '#22D3EE' : isOnline ? '#10B981' : isLow ? '#F59E0B' : '#94A3B8'}
                      strokeWidth={isStation ? '3' : '2'}
                      filter="url(#label-glow)"
                    />

                    {/* Inner Core */}
                    <circle 
                      r={isStation ? 5 : 3.5} 
                      fill={isStation ? '#22D3EE' : isOnline ? '#10B981' : isLow ? '#F59E0B' : '#64748B'} 
                    />

                    {/* Node Tag Pill */}
                    <rect
                      x="-65"
                      y={isStation ? "-32" : "14"}
                      width="130"
                      height="20"
                      rx="10"
                      fill="#0B131E"
                      stroke={isStation ? '#22D3EE' : '#334155'}
                      strokeWidth="1"
                      filter="url(#label-glow)"
                    />
                    <text
                      x="0"
                      y={isStation ? "-18" : "28"}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontFamily="JetBrains Mono"
                      fontSize="9.5"
                      fontWeight="700"
                    >
                      {isStation ? '★ STN-01 Base Gateway' : `${node.id} (${node.name.split(' ')[0]})`}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* GLOWING COLOR-CODED INCIDENT PINS */}
          <g id="incident-pins">
            {incidents.map((inc) => {
              const { x, y } = projectCoords(inc.latitude, inc.longitude);
              const isSelected = String(inc.id) === String(activeSelectedId) || inc.incident_code === activeSelectedId;
              const isStaleGps = inc.gps_status === 'stale' || inc.gps_status === 'unavailable';
              const isNew = inc.status === 'New';

              // Emergency Pin Colors
              let pinColor = '#EF4444'; // medical
              if (inc.emergency_type === 'fire') pinColor = '#F97316';
              else if (inc.emergency_type === 'crime') pinColor = '#A855F7';
              else if (inc.emergency_type === 'traffic_accident' || inc.emergency_type === 'traffic') pinColor = '#F59E0B';
              else if (inc.emergency_type === 'disaster') pinColor = '#14B8A6';

              return (
                <g
                  key={inc.id}
                  transform={`translate(${x}, ${y})`}
                  className="cursor-pointer transition-transform hover:scale-125"
                  onClick={() => handlePinClick(inc)}
                >
                  {/* Stale / Missing GPS Dashed Amber Warning Ring */}
                  {isStaleGps && (
                    <circle
                      r="26"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="2.5"
                      strokeDasharray="4 4"
                      className="animate-spin"
                      style={{ transformOrigin: '0 0', animationDuration: '6s' }}
                    />
                  )}

                  {/* New Incident Glowing Ping Wave */}
                  {isNew && !isStaleGps && (
                    <circle r="24" fill={pinColor} fillOpacity="0.3">
                      <animate attributeName="r" values="14;28;14" dur="1.8s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0.1;0.8" dur="1.8s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Selected Outer Halo */}
                  {isSelected && (
                    <circle r="22" fill="none" stroke="#FFFFFF" strokeWidth="2.5" filter="url(#label-glow)" />
                  )}

                  {/* Main Pin Body */}
                  <circle
                    r={isSelected ? 14 : 11}
                    fill={pinColor}
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    filter="url(#label-glow)"
                  />

                  {/* Inner White Center */}
                  <circle r={isSelected ? 5 : 4} fill="#FFFFFF" />

                  {/* Incident Code Badge */}
                  <rect
                    x="-44"
                    y="-28"
                    width="88"
                    height="18"
                    rx="9"
                    fill="#0B131E"
                    stroke="#FFFFFF"
                    strokeWidth="1"
                    filter="url(#label-glow)"
                  />
                  <text
                    x="0"
                    y="-16"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontFamily="JetBrains Mono"
                    fontSize="9"
                    fontWeight="700"
                  >
                    {inc.incident_code}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* 4. Floating Selected Incident Preview Card (BOTTOM RIGHT) */}
      {selectedIncident && (
        <div className="absolute bottom-5 right-5 left-5 sm:left-auto sm:w-[380px] z-30 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-modal animate-in fade-in slide-in-from-bottom-2 duration-200 text-slate-900 dark:text-slate-100">
          <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                {selectedIncident.incident_code}
              </span>
              <EmergencyBadge type={selectedIncident.emergency_type} />
            </div>
            <button
              onClick={() => setInternalSelectedId(null)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {selectedIncident.resident_name || (selectedIncident.is_registered_flag === 1 ? 'Registered Citizen' : 'Unknown Resident')}
              </span>
              <StatusBadge status={selectedIncident.status} />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{selectedIncident.area_name}</span>
            </div>

            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <GpsBadge status={selectedIncident.gps_status} />
              <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                {selectedIncident.hop_count} {selectedIncident.hop_count === 1 ? 'hop' : 'hops'} ({selectedIncident.rssi} dBm)
              </span>
            </div>
          </div>

          {/* Action Buttons: Acknowledge & Open Full Details */}
          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            {selectedIncident.status === 'New' && (
              <button
                onClick={(e) => handleQuickAcknowledge(e, selectedIncident)}
                disabled={isAcknowledging}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 disabled:opacity-50 transition-colors shadow-sm"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{isAcknowledging ? 'Acknowledging...' : 'Acknowledge'}</span>
              </button>
            )}

            <Link
              to={`/incidents/${selectedIncident.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors border border-transparent dark:border-slate-700"
            >
              <span>Open Full Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* 5. Telemetry Watermark & Sensor Stamp (Bottom Left) */}
      <div className="absolute bottom-3 left-3 pointer-events-none z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-sm border border-slate-700/80 text-slate-300 font-mono text-[10px]">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>ESRI Satellite Aerial + LoRa RF Telemetry (13.9412° N, 121.1624° E)</span>
      </div>
    </div>
  );
}
