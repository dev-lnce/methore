import React, { useState, useRef, useEffect } from 'react';
import { 
  Radio, 
  Battery, 
  Navigation, 
  MapPin, 
  HeartPulse, 
  Flame, 
  ShieldAlert, 
  Car, 
  Waves, 
  Check, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Wifi,
  WifiOff
} from 'lucide-react';
import { playHandheldBuzzer, playAckChime } from '../utils/audio';
import { api } from '../services/api';

const RESIDENT_PRESETS = [
  { user_id: 'RES-1012', device_id: 'HND-042', name: 'Morgan Santos', area: '42 Mabini St, Purok 2 Plaza', lat: 13.9412, lon: 121.1624 },
  { user_id: 'RES-1009', device_id: 'HND-009', name: 'Taylor Cruz', area: '15 Rizal Ave, Purok 3 Market', lat: 13.9435, lon: 121.1650 },
  { user_id: 'RES-1010', device_id: 'HND-010', name: 'Casey Navarro', area: '8 Bonifacio St, Purok 1', lat: 13.9422, lon: 121.1600 },
  { user_id: 'UNK-09', device_id: 'HND-999', name: 'Unregistered Citizen', area: 'Purok 4 Outpost', lat: 13.9400, lon: 121.1610 }
];

export default function HandheldSimulatorPage() {
  const [selectedPreset, setSelectedPreset] = useState(RESIDENT_PRESETS[0]);
  const [selectedCategory, setSelectedCategory] = useState('medical');
  const [gpsFixState, setGpsFixState] = useState('valid'); // 'valid', 'stale', 'unavailable'
  const [hopCount, setHopCount] = useState(2);

  // OLED state: 'idle', 'sending', 'to_mesh', 'delivered', 'failed'
  const [oledState, setOledState] = useState('idle');
  const [ackInfo, setAckInfo] = useState(null);

  // Hold-to-broadcast state
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdIntervalRef = useRef(null);

  const categories = [
    {
      key: 'medical',
      label: 'MEDICAL EMERGENCY',
      subtitle: 'Illness, severe trauma, injury',
      icon: HeartPulse,
      border: 'border-red-600 ring-2 ring-red-500/20 bg-red-50 text-red-900',
      activeBadge: 'bg-red-600 text-white'
    },
    {
      key: 'fire',
      label: 'FIRE ALERT',
      subtitle: 'Structure, wildfire, electrical',
      icon: Flame,
      border: 'border-orange-500 ring-2 ring-orange-500/20 bg-orange-50 text-orange-950',
      activeBadge: 'bg-orange-600 text-white'
    },
    {
      key: 'crime',
      label: 'CRIME / SECURITY',
      subtitle: 'Assault, threat, intrusion',
      icon: ShieldAlert,
      border: 'border-purple-600 ring-2 ring-purple-500/20 bg-purple-50 text-purple-950',
      activeBadge: 'bg-purple-600 text-white'
    },
    {
      key: 'traffic',
      label: 'TRAFFIC ACCIDENT',
      subtitle: 'Vehicular collision, pedestrian hit',
      icon: Car,
      border: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50 text-amber-950',
      activeBadge: 'bg-amber-600 text-white'
    },
    {
      key: 'disaster',
      label: 'DISASTER / FLOOD',
      subtitle: 'Flash flood, storm surge, landslide',
      icon: Waves,
      border: 'border-teal-600 ring-2 ring-teal-500/20 bg-teal-50 text-teal-950',
      activeBadge: 'bg-teal-600 text-white'
    }
  ];

  // Trigger LoRa Broadcast
  const executeBroadcast = async () => {
    setHoldProgress(0);
    setIsHolding(false);
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);

    setOledState('sending');
    playHandheldBuzzer();

    // Step 1 -> Step 2
    setTimeout(() => {
      setOledState('to_mesh');
    }, 450);

    // Call API via dual-mode service
    try {
      const now = new Date().toISOString();
      const data = await api.packets.ingest({
        user_id: selectedPreset.user_id,
        device_id: selectedPreset.device_id,
        emergency_type: selectedCategory === 'traffic' ? 'traffic_accident' : selectedCategory,
        latitude: selectedPreset.lat + (Math.random() - 0.5) * 0.001,
        longitude: selectedPreset.lon + (Math.random() - 0.5) * 0.001,
        area_name: selectedPreset.area,
        gps_status: gpsFixState,
        report_time: now,
        hop_count: hopCount,
        rssi: -72 - (hopCount * 6),
        snr: Number((8.5 - hopCount * 1.2).toFixed(1)),
        notes: `Tactical SOS trigger from Handheld device ${selectedPreset.device_id}`
      });

      setTimeout(() => {
        setOledState('delivered');
        setAckInfo(data);
        playAckChime();
        // Haptic buzzer feedback
        setTimeout(() => playHandheldBuzzer(), 150);
      }, 1000);
    } catch (err) {
      console.error('Handheld broadcast failed:', err);
      setTimeout(() => setOledState('failed'), 800);
    }
  };

  // Hold-to-broadcast button handlers
  const handleMouseDown = () => {
    setIsHolding(true);
    setHoldProgress(0);
    holdIntervalRef.current = setInterval(() => {
      setHoldProgress(prev => {
        if (prev >= 100) {
          clearInterval(holdIntervalRef.current);
          executeBroadcast();
          return 100;
        }
        return prev + 10;
      });
    }, 120);
  };

  const handleMouseUp = () => {
    if (holdProgress < 100) {
      setIsHolding(false);
      setHoldProgress(0);
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full py-4 animate-in fade-in duration-200">
      {/* Device Shell Context Banner */}
      <div className="mb-4 text-center max-w-sm">
        <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 rounded-full shadow-sm inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>915 MHz Rugged Citizen Handset Simulator</span>
        </span>
      </div>

      {/* Main 360px Rugged Handset Device Chassis */}
      <div className="w-full max-w-[365px] bg-slate-900 text-white rounded-[36px] p-4 shadow-2xl border-4 border-slate-800 flex flex-col gap-3 relative select-none">
        {/* Antenna Visual Cue */}
        <div className="absolute -top-7 left-10 w-4 h-8 bg-slate-800 rounded-t-md border-t-2 border-slate-700 shadow-sm" />

        {/* 1. Top Tactical Hardware Bar */}
        <section className="bg-slate-800/80 rounded-2xl p-3 border border-white/10 flex flex-col gap-2">
          {/* Identity & Battery row */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <Radio className="w-4 h-4 text-emerald-400 shrink-0" />
              <select
                value={selectedPreset.user_id}
                onChange={(e) => {
                  const found = RESIDENT_PRESETS.find(p => p.user_id === e.target.value);
                  if (found) setSelectedPreset(found);
                }}
                className="bg-transparent font-mono font-bold text-white outline-none cursor-pointer text-xs"
              >
                {RESIDENT_PRESETS.map((p) => (
                  <option key={p.user_id} value={p.user_id} className="bg-slate-800 text-white">
                    {p.device_id} ({p.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full font-mono text-[11px] text-emerald-300">
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
              <span>88%</span>
            </div>
          </div>

          {/* Interactive GNSS & Hop Selector Pills */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            {/* GNSS Fix Pill */}
            <button
              onClick={() => {
                const next = gpsFixState === 'valid' ? 'stale' : gpsFixState === 'stale' ? 'unavailable' : 'valid';
                setGpsFixState(next);
              }}
              type="button"
              className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1.5 rounded-xl border border-white/5 hover:border-white/20 transition-colors text-left"
              title="Click to toggle GPS fix mode"
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  gpsFixState === 'valid'
                    ? 'bg-emerald-400 animate-pulse'
                    : gpsFixState === 'stale'
                    ? 'bg-amber-400'
                    : 'bg-rose-500'
                }`}
              />
              <div className="min-w-0">
                <span className="text-[9px] uppercase text-slate-400 font-bold block leading-none">GNSS LOCK</span>
                <span className="font-semibold text-white leading-tight truncate block capitalize">
                  {gpsFixState === 'valid' ? 'Live 3D Fix' : gpsFixState === 'stale' ? 'Stale GPS' : 'No Lock'}
                </span>
              </div>
            </button>

            {/* Mesh Hops Pill */}
            <button
              onClick={() => {
                setHopCount(prev => (prev % 3) + 1);
              }}
              type="button"
              className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1.5 rounded-xl border border-white/5 hover:border-white/20 transition-colors text-left"
              title="Click to cycle hop count"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-[9px] uppercase text-slate-400 font-bold block leading-none">LORA MESH</span>
                <span className="font-semibold text-white leading-tight truncate block">
                  {hopCount} {hopCount === 1 ? 'Hop Direct' : `${hopCount} Hops Relayed`}
                </span>
              </div>
            </button>
          </div>
        </section>

        {/* 2. OLED Transmission Display & Step Visualizer */}
        <section className="bg-slate-950 rounded-2xl p-3 border border-white/10 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  oledState === 'delivered'
                    ? 'bg-emerald-400 animate-ping'
                    : oledState === 'sending' || oledState === 'to_mesh'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-slate-500'
                }`}
              />
              <span className="font-mono text-xs font-bold text-white tracking-wider">
                {oledState === 'idle' && 'READY TO BROADCAST'}
                {oledState === 'sending' && '1. TRANSMITTING (RF)...'}
                {oledState === 'to_mesh' && '2. ROUTING VIA RELAY...'}
                {oledState === 'delivered' && '3. DELIVERY CONFIRMED (ACK)'}
                {oledState === 'failed' && 'TRANSMISSION FAILED (RETRY)'}
              </span>
            </div>

            <span className="text-[10px] font-mono text-slate-400 bg-white/10 px-1.5 py-0.5 rounded">
              915 MHz
            </span>
          </div>

          {/* 3 Step Visualizer */}
          <div className="grid grid-cols-3 gap-1 text-[10px] font-mono pt-1">
            <div
              className={`py-1 rounded-lg text-center font-bold ${
                oledState === 'sending' || oledState === 'to_mesh' || oledState === 'delivered'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-white/5 text-slate-500'
              }`}
            >
              1. RF Hook
            </div>
            <div
              className={`py-1 rounded-lg text-center font-bold ${
                oledState === 'to_mesh' || oledState === 'delivered'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-white/5 text-slate-500'
              }`}
            >
              2. Mesh Relay
            </div>
            <div
              className={`py-1 rounded-lg text-center font-bold ${
                oledState === 'delivered'
                  ? 'bg-emerald-500 text-white font-extrabold shadow-sm'
                  : 'bg-white/5 text-slate-500'
              }`}
            >
              3. Base ACK
            </div>
          </div>

          {ackInfo && oledState === 'delivered' && (
            <div className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 p-2 rounded-xl border border-emerald-500/30 flex items-center justify-between">
              <span>Gate: {ackInfo.ack_payload?.gateway_node || 'STN-01'}</span>
              <span>Incident: {ackInfo.incident_code}</span>
            </div>
          )}
        </section>

        {/* 3. Five Large Emergency Classification Buttons */}
        <section className="flex flex-col gap-2">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            const Icon = cat.icon;

            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                type="button"
                className={`w-full min-h-[58px] p-2.5 rounded-2xl flex items-center justify-between transition-all duration-150 border-2 text-left ${
                  isSelected
                    ? cat.border
                    : 'bg-slate-800/90 border-slate-700/80 text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                      isSelected ? cat.activeBadge : 'bg-white/10 text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs tracking-tight uppercase leading-none">
                      {cat.label}
                    </h3>
                    <p className={`text-[11px] pt-1 leading-none ${isSelected ? 'opacity-90' : 'text-slate-400'}`}>
                      {cat.subtitle}
                    </p>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    isSelected ? cat.activeBadge : 'border border-white/20'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>
            );
          })}
        </section>

        {/* 4. Press-and-Hold SOS Broadcast Trigger Button */}
        <div className="pt-2 flex flex-col gap-2">
          <div className="relative overflow-hidden rounded-2xl">
            {/* Progress fill bar */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-red-700 transition-all duration-100 pointer-events-none"
              style={{ width: `${holdProgress}%` }}
            />

            <button
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchEnd={handleMouseUp}
              type="button"
              className="relative z-10 w-full py-3.5 px-4 rounded-2xl bg-red-600 text-white text-sm font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-red-500 active:scale-[0.98] transition-all shadow-lg shadow-red-950/40"
            >
              <span>{isHolding ? `HOLDING... ${holdProgress}%` : 'HOLD TO BROADCAST SOS'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
            <span>2-step safety hold active</span>
            <button
              onClick={executeBroadcast}
              type="button"
              className="underline hover:text-white"
            >
              Instant 1-Click Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
