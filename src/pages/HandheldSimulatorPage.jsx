import React, { useState, useRef, useEffect, useCallback } from 'react';
import { playHandheldBuzzer, playAckChime } from '../utils/audio';
import { api } from '../services/api';
import HandheldDevice, { DEVICE_WIDTH, DEVICE_HEIGHT, ANTENNA_HEIGHT } from '../components/handheld/HandheldDevice';
import SimulatorControls from '../components/handheld/SimulatorControls';
import { useFitScale } from '../components/handheld/useFitScale';
import { HOLD_TO_SEND_MS } from '../components/handheld/deviceConfig';

const RESIDENT_PRESETS = [
  { user_id: 'RES-1012', device_id: 'HND-042', name: 'Morgan Santos', area: '42 Mabini St, Purok 2 Plaza', lat: 13.9412, lon: 121.1624 },
  { user_id: 'RES-1009', device_id: 'HND-009', name: 'Taylor Cruz', area: '15 Rizal Ave, Purok 3 Market', lat: 13.9435, lon: 121.1650 },
  { user_id: 'RES-1010', device_id: 'HND-010', name: 'Casey Navarro', area: '8 Bonifacio St, Purok 1', lat: 13.9422, lon: 121.1600 },
  { user_id: 'UNK-09', device_id: 'HND-999', name: 'Unregistered Citizen', area: 'Purok 4 Outpost', lat: 13.9400, lon: 121.1610 }
];

const formatClock = (date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

export default function HandheldSimulatorPage() {
  const [selectedPreset, setSelectedPreset] = useState(RESIDENT_PRESETS[0]);
  const [selectedCategory, setSelectedCategory] = useState('medical');
  const [gpsFixState, setGpsFixState] = useState('valid'); // 'valid', 'stale', 'unavailable'
  const [hopCount, setHopCount] = useState(2);
  const [failNext, setFailNext] = useState(false);

  // LCD screen: 'idle', 'confirm', 'sending', 'to_mesh', 'delivered', 'failed'
  const [screen, setScreen] = useState('idle');
  const [receivedTime, setReceivedTime] = useState('');
  const [lastResult, setLastResult] = useState(null);

  // Hold-to-send state
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimerRef = useRef(null);

  const timeoutsRef = useRef([]);
  const sendingRef = useRef(false);
  const latestRef = useRef({});
  const stageRef = useRef(null);

  const scale = useFitScale(stageRef, {
    width: DEVICE_WIDTH,
    height: DEVICE_HEIGHT + ANTENNA_HEIGHT,
    verticalReserve: 120
  });

  // Timers and hold callbacks fire outside React's render, so they read the
  // newest values from here instead of closing over stale state.
  useEffect(() => {
    latestRef.current = { screen, selectedPreset, selectedCategory, gpsFixState, hopCount, failNext };
  });

  const later = useCallback((fn, ms) => {
    timeoutsRef.current.push(setTimeout(fn, ms));
  }, []);

  const clearHold = useCallback(() => {
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    holdTimerRef.current = null;
    setIsHolding(false);
    setHoldProgress(0);
  }, []);

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  // Trigger LoRa Broadcast
  const executeBroadcast = async () => {
    const { selectedPreset: preset, selectedCategory: category, gpsFixState: gps, hopCount: hops, failNext: loseAck } = latestRef.current;
    if (sendingRef.current) return;
    sendingRef.current = true;

    clearHold();
    if (loseAck) setFailNext(false);

    setScreen('sending');
    playHandheldBuzzer();

    // Step 1 -> Step 2
    later(() => setScreen((s) => (s === 'sending' ? 'to_mesh' : s)), 450);

    // Call API via dual-mode service
    try {
      const now = new Date().toISOString();
      const data = await api.packets.ingest({
        user_id: preset.user_id,
        device_id: preset.device_id,
        emergency_type: category === 'traffic' ? 'traffic_accident' : category,
        latitude: preset.lat + (Math.random() - 0.5) * 0.001,
        longitude: preset.lon + (Math.random() - 0.5) * 0.001,
        area_name: preset.area,
        gps_status: gps,
        report_time: now,
        hop_count: hops,
        rssi: -72 - (hops * 6),
        snr: Number((8.5 - hops * 1.2).toFixed(1)),
        notes: `Tactical SOS trigger from Handheld device ${preset.device_id}`
      });

      if (loseAck || data.acknowledged === false) {
        // Packet reached the station but the return path dropped: the handset
        // hears nothing and says so instead of faking a success.
        later(() => {
          setScreen('failed');
          setLastResult({ outcome: 'ack_lost', incident_code: data.incident_code, is_registered_flag: data.is_registered_flag });
          sendingRef.current = false;
        }, 1800);
        return;
      }

      later(() => {
        setReceivedTime(formatClock(new Date()));
        setScreen('delivered');
        setLastResult({
          outcome: 'delivered',
          incident_code: data.incident_code,
          is_registered_flag: data.is_registered_flag,
          ack_id: data.ack_payload?.ack_id,
          gateway: data.ack_payload?.gateway_node || 'STN-01'
        });
        playAckChime();
        // Haptic buzzer feedback
        later(() => playHandheldBuzzer(), 150);
        sendingRef.current = false;
      }, 1000);
    } catch (err) {
      console.error('Handheld broadcast failed:', err);
      later(() => {
        setScreen('failed');
        setLastResult({ outcome: 'error' });
        sendingRef.current = false;
      }, 800);
    }
  };

  // Hold-to-send: progress is time-based so the fill always matches the
  // printed "HOLD 2 SEC".
  const startHold = () => {
    if (latestRef.current.screen !== 'confirm' || holdTimerRef.current) return;
    const startedAt = performance.now();
    setIsHolding(true);
    setHoldProgress(0);
    holdTimerRef.current = setInterval(() => {
      const pct = Math.min(100, ((performance.now() - startedAt) / HOLD_TO_SEND_MS) * 100);
      setHoldProgress(Math.round(pct));
      if (pct >= 100) executeBroadcast();
    }, 50);
  };

  const endHold = () => {
    if (holdTimerRef.current) clearHold();
  };

  const pickIncident = (key) => {
    if (sendingRef.current) return;
    clearHold();
    setSelectedCategory(key);
    setScreen('confirm');
  };

  const cancel = () => {
    if (sendingRef.current) return;
    clearHold();
    setScreen('idle');
  };

  const handlePresetChange = (userId) => {
    const found = RESIDENT_PRESETS.find((p) => p.user_id === userId);
    if (found) setSelectedPreset(found);
  };

  return (
    <div className="flex flex-col items-center w-full py-4 animate-in fade-in duration-200">
      {/* Context banner */}
      <div className="mb-6 text-center max-w-sm">
        <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 rounded-full shadow-sm inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>915 MHz Rugged Citizen Handset Simulator</span>
        </span>
      </div>

      <div className="w-full flex flex-col xl:flex-row items-center xl:items-start justify-center gap-8">
        {/* Handset, scaled as a whole when the window is small */}
        <div ref={stageRef} className="w-full max-w-[400px] xl:w-[400px] flex justify-center">
          <div style={{ width: DEVICE_WIDTH * scale, height: (DEVICE_HEIGHT + ANTENNA_HEIGHT) * scale }}>
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
              <HandheldDevice
                screen={screen}
                userId={selectedPreset.user_id}
                gpsState={gpsFixState}
                selectedType={selectedCategory}
                holdProgress={holdProgress}
                isHolding={isHolding}
                receivedTime={receivedTime}
                onPick={pickIncident}
                onCancel={cancel}
                onHoldStart={startHold}
                onHoldEnd={endHold}
              />
            </div>
          </div>
        </div>

        <SimulatorControls
          presets={RESIDENT_PRESETS}
          preset={selectedPreset}
          onPresetChange={handlePresetChange}
          gpsState={gpsFixState}
          onGpsChange={setGpsFixState}
          hopCount={hopCount}
          onHopChange={setHopCount}
          failNext={failNext}
          onFailNextChange={setFailNext}
          canInstantSend={screen === 'confirm'}
          onInstantSend={executeBroadcast}
          lastResult={lastResult}
        />
      </div>
    </div>
  );
}
