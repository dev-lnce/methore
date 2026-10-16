import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Radio, 
  Cpu, 
  Usb, 
  Save, 
  Activity, 
  Battery, 
  BatteryLow, 
  Signal, 
  CheckCircle2,
  Radar
} from 'lucide-react';
import { useAudioAlert } from '../context/AudioAlertContext';
import api from '../services/api';

export default function NetworkStatusPage() {
  const { triggerAck } = useAudioAlert();

  const [settings, setSettings] = useState({
    serial_port: 'COM4',
    baud_rate: 115200,
    gateway_id: 'STN-GATEWAY-01',
    is_connected: 1,
    last_packet_time: '2026-10-16T14:32:07+08:00',
    channel_name: 'METHORE-BRGY-CH0',
    frequency: '915.0 MHz',
    hop_limit: 3,
    retry_limit: 3,
    duplicates_discarded: 18
  });

  const [nodes, setNodes] = useState([]);
  const [summary, setSummary] = useState({
    total_nodes: 0,
    online_nodes: 0,
    low_battery_nodes: 0,
    offline_nodes: 0
  });

  const [isSaving, setIsSaving] = useState(false);
  const [pingFeedback, setPingFeedback] = useState({});
  const [saveSuccess, setSaveSuccess] = useState('');

  const fetchNetworkStatus = async () => {
    try {
      const data = await api.network.getStatus();
      if (data) {
        if (data.settings) setSettings(data.settings);
        if (data.nodes) setNodes(data.nodes);
        if (data.summary) setSummary(data.summary);
      }
    } catch (err) {
      console.error('Error fetching network status:', err);
    }
  };

  useEffect(() => {
    fetchNetworkStatus();
    const interval = setInterval(fetchNetworkStatus, 5000);
    const handleReset = () => fetchNetworkStatus();
    window.addEventListener('methore_data_reset', handleReset);
    return () => {
      clearInterval(interval);
      window.removeEventListener('methore_data_reset', handleReset);
    };
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess('');

    try {
      triggerAck();
      const data = await api.network.updateSettings(settings);
      if (data && data.settings) {
        setSettings(data.settings);
        setSaveSuccess('Network routing policy successfully updated.');
        setTimeout(() => setSaveSuccess(''), 4000);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePingNode = async (nodeId) => {
    setPingFeedback(prev => ({ ...prev, [nodeId]: 'pinging' }));
    try {
      triggerAck();
      const data = await api.network.pingNode(nodeId);
      if (data && data.ping_telemetry) {
        setPingFeedback(prev => ({
          ...prev,
          [nodeId]: `${data.ping_telemetry.latency_ms}ms (RSSI ${data.ping_telemetry.rssi} dBm)`
        }));
        fetchNetworkStatus();
      }
    } catch (err) {
      setPingFeedback(prev => ({ ...prev, [nodeId]: 'Failed' }));
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
      {/* 1. Page Header (Bloated multi-line subtitle removed) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Mesh Network & Base Station
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Gateway hardware connection, node battery states, and RF link topology
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              nodes.forEach(n => handlePingNode(n.node_id));
            }}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-700 transition-all shadow-sm border border-transparent dark:border-slate-700"
          >
            <Radar className="w-4 h-4 text-emerald-400" />
            <span>Ping All Nodes</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/70 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* 2. Top Bento Row (Left USB Gateway Hero 6-col + Right Channel Settings 6-col) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Dark Hero Card: USB Link (6 Cols) */}
        <div className="lg:col-span-6 bg-slate-900 dark:bg-slate-900/90 text-white rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-card border border-slate-800 dark:border-slate-700/80">
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-400 font-mono text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Connected • Hardware Serial Lock
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-white/10 text-slate-300 font-mono text-xs font-bold">
                915.0 MHz
              </span>
            </div>

            {/* Hardware serial metadata bar */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 font-mono text-xs text-slate-300 flex items-center justify-between flex-wrap gap-2">
              <span className="flex items-center gap-1.5 text-slate-200 font-semibold">
                <Usb className="w-4 h-4 text-emerald-400" />
                {settings.serial_port} • {settings.baud_rate || 115200} baud
              </span>
              <span className="text-slate-400">
                Gateway: {settings.gateway_id || 'STN-GATEWAY-01'}
              </span>
              <span className="text-emerald-400 font-bold">
                {settings.duplicates_discarded} duplicates discarded
              </span>
            </div>

            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                Active LoRa Channel
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {settings.channel_name}
              </h2>
            </div>
          </div>

          {/* 3 Metric Pills Footer */}
          <div className="relative z-10 grid grid-cols-3 gap-2 pt-4 mt-4 border-t border-white/10 font-mono text-xs text-center">
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 block text-[10px] uppercase">Hop Limit</span>
              <span className="font-bold text-white text-sm">{settings.hop_limit} Hops</span>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 block text-[10px] uppercase">Retry Limit</span>
              <span className="font-bold text-white text-sm">{settings.retry_limit} Retries</span>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 block text-[10px] uppercase">Suppression</span>
              <span className="font-bold text-emerald-400 text-sm">Dedup 30s</span>
            </div>
          </div>
        </div>

        {/* Right White Card: Network Configuration Form (6 Cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Routing & Frequency Parameters
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Local station hardware configuration
              </p>
            </div>
            <Cpu className="w-5 h-5 text-slate-400" />
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-3.5 my-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Serial Port
                </label>
                <input
                  type="text"
                  value={settings.serial_port}
                  onChange={(e) => setSettings({ ...settings, serial_port: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-900 dark:focus:border-slate-400 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  RF Channel Identifier
                </label>
                <input
                  type="text"
                  value={settings.channel_name}
                  onChange={(e) => setSettings({ ...settings, channel_name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-900 dark:focus:border-slate-400 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Max Hop Count
                </label>
                <select
                  value={settings.hop_limit}
                  onChange={(e) => setSettings({ ...settings, hop_limit: parseInt(e.target.value, 10) })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-900 dark:focus:border-slate-400 outline-none"
                >
                  <option value={1}>1 Hop (Direct RF Only)</option>
                  <option value={2}>2 Hops</option>
                  <option value={3}>3 Hops (Recommended)</option>
                  <option value={4}>4 Hops</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Retransmission Limit
                </label>
                <select
                  value={settings.retry_limit}
                  onChange={(e) => setSettings({ ...settings, retry_limit: parseInt(e.target.value, 10) })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-900 dark:focus:border-slate-400 outline-none"
                >
                  <option value={1}>1 Attempt</option>
                  <option value={2}>2 Attempts</option>
                  <option value={3}>3 Attempts</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 border border-transparent dark:border-slate-700"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving Policy...' : 'Save Network Policy'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* 3. Mesh Fleet Nodes Table (6 nodes: 1 Station, 3 Relay Online, 1 Low Battery 19%, 1 Offline) */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Radio className="w-5 h-5 text-slate-500" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Mesh Nodes Topology ({nodes.length} Nodes)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                1 Station Base • 3 Solar Relays Online • 1 Low Battery (19%) • 1 Offline
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/70 px-2.5 py-1 rounded-full font-semibold">
              {summary.online_nodes} Online
            </span>
            <span className="font-mono text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/70 px-2.5 py-1 rounded-full font-semibold">
              {summary.low_battery_nodes} Low Battery
            </span>
            <span className="font-mono text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full font-semibold">
              {summary.offline_nodes} Offline
            </span>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm divide-y divide-slate-100 dark:divide-slate-800/70">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Node ID & Role</th>
                <th className="py-3 px-4">Name & Placement</th>
                <th className="py-3 px-4">Power & Battery</th>
                <th className="py-3 px-4">Signal Quality</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Diagnostic Ping</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 bg-white dark:bg-[#111827]">
              {nodes.map((node) => {
                const isStation = node.role === 'station';
                const isOnline = node.status === 'online';
                const isLow = node.status === 'low_battery';
                const pingResult = pingFeedback[node.node_id];

                return (
                  <tr key={node.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Node ID */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                          {node.node_id}
                        </span>
                        <span className="text-[11px] text-slate-500 capitalize">
                          {node.role}
                        </span>
                      </div>
                    </td>

                    {/* Name */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                        {node.name}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        Last heard: {node.last_heard ? node.last_heard.slice(11, 19) + ' UTC' : 'Never'}
                      </span>
                    </td>

                    {/* Power */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs">
                      <div className="flex items-center gap-2">
                        {node.battery_level < 25 ? (
                          <BatteryLow className="w-4 h-4 text-rose-500" />
                        ) : (
                          <Battery className="w-4 h-4 text-emerald-500" />
                        )}
                        <span className={`font-semibold ${node.battery_level < 25 ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-800 dark:text-slate-200'}`}>
                          {node.battery_level}%
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({node.power_source})
                        </span>
                      </div>
                    </td>

                    {/* Signal */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Signal className="w-3.5 h-3.5 text-slate-400" />
                        <span>RSSI {node.rssi} dBm</span>
                        <span className="text-slate-400">• SNR +{node.snr} dB</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          isOnline
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/70'
                            : isLow
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/70'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/70'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isOnline ? 'bg-emerald-500 animate-pulse' : isLow ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                        />
                        <span>
                          {isOnline ? 'Online' : isLow ? 'Low Battery (19%)' : 'Offline / Unreachable'}
                        </span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      {pingResult ? (
                        <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                          {pingResult}
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePingNode(node.node_id)}
                          className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-900 hover:text-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all border border-slate-200/60 dark:border-slate-700"
                          type="button"
                        >
                          Ping Node
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
