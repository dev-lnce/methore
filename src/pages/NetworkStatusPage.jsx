import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Radio, 
  Cpu, 
  Usb, 
  Save, 
  RefreshCw, 
  Activity, 
  ShieldCheck, 
  Battery, 
  BatteryLow, 
  Signal, 
  CheckCircle2,
  Lock,
  Radar
} from 'lucide-react';
import { useAudioAlert } from '../context/AudioAlertContext';

export default function NetworkStatusPage() {
  const { triggerAck } = useAudioAlert();

  const [settings, setSettings] = useState({
    serial_port: 'COM4',
    is_connected: 1,
    last_packet_time: '',
    channel_name: 'METHORE-BRGY-CH0',
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
      const res = await fetch('/api/network/status');
      if (res.ok) {
        const data = await res.json();
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
    return () => clearInterval(interval);
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess('');

    try {
      triggerAck();
      const res = await fetch('/api/network/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        const data = await res.json();
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
      const res = await fetch(`/api/network/nodes/${nodeId}/ping`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
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
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Mesh Network & Base Station
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Sub-GHz 915 MHz Hardware Channel, Serial USB Interface & Node Topology
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              nodes.forEach(n => handlePingNode(n.node_id));
            }}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-sm"
          >
            <Radar className="w-4 h-4 text-emerald-400" />
            <span>Ping All Nodes</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* 2. Top Bento Row (Left USB Link Hero 6-col + Right Channel Settings 6-col) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Dark Hero Card: USB Link (6 Cols) */}
        <div className="lg:col-span-6 bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-card border border-slate-800">
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-400 font-mono text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Connected • Hardware Serial Lock
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-white/10 text-slate-300 font-mono text-xs font-bold">
                CH 02
              </span>
            </div>

            {/* Hardware serial metadata bar */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 font-mono text-xs text-slate-300 flex items-center justify-between flex-wrap gap-2">
              <span className="flex items-center gap-1.5 text-slate-200">
                <Usb className="w-4 h-4 text-emerald-400" />
                Port: {settings.serial_port} (115200 baud)
              </span>
              <span className="text-slate-400">Node: STN-GATEWAY-01</span>
            </div>

            {/* 3-Column Telemetry */}
            <div className="grid grid-cols-3 gap-2.5 mt-2">
              <div className="p-3 rounded-2xl bg-white/5 flex flex-col justify-between">
                <span className="text-[11px] text-slate-400">Last Packet</span>
                <span className="font-mono text-sm font-bold text-white mt-1">
                  14s ago
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Radio rx</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 flex flex-col justify-between">
                <span className="text-[11px] text-slate-400">Dedup Suppressed</span>
                <span className="font-mono text-sm font-bold text-white mt-1">
                  {settings.duplicates_discarded}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Dedup window 30s</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 flex flex-col justify-between">
                <span className="text-[11px] text-slate-400">DB Integrity</span>
                <span className="font-mono text-sm font-bold text-emerald-400 mt-1">
                  Healthy
                </span>
                <span className="text-[10px] text-slate-500 font-mono">SQLite WAL</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-3 mt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Active Buffer: 0 drops
            </span>
            <span>Flow Control: RTS/CTS</span>
          </div>
        </div>

        {/* Right White Card: Channel & Hop Routing Config (6 Cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-card flex flex-col justify-between">
          <form onSubmit={handleSaveSettings} className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Channel & Routing Policy</h3>
                <p className="text-xs text-slate-500">Barangay emergency transmission parameters</p>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-mono text-xs font-semibold border border-emerald-200">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                AES-256 Active
              </span>
            </div>

            {/* Channel Field */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Primary Mesh Channel
              </label>
              <input
                type="text"
                value={settings.channel_name}
                onChange={(e) => setSettings({ ...settings, channel_name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 font-mono text-xs text-slate-900 font-semibold focus:bg-white focus:border-slate-900 outline-none transition-all shadow-sm"
              />
            </div>

            {/* Hop Limit 1 to 5 selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Maximum Hop Limit</label>
                <span className="text-xs text-slate-400 font-mono">
                  Coverage: ~{settings.hop_limit * 2.5} km
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-2xl">
                {[1, 2, 3, 4, 5].map((hop) => {
                  const isActive = settings.hop_limit === hop;
                  return (
                    <button
                      key={hop}
                      type="button"
                      onClick={() => setSettings({ ...settings, hop_limit: hop })}
                      className={`py-1.5 rounded-xl text-xs font-bold text-center transition-all ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                      }`}
                    >
                      {hop} {hop === 1 ? 'Hop' : 'Hops'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ACK Retry Limit */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-xs font-bold text-slate-800 block">ACK Retry Limit</span>
                <span className="text-[11px] text-slate-400">Max retransmissions before failover</span>
              </div>
              <select
                value={settings.retry_limit}
                onChange={(e) => setSettings({ ...settings, retry_limit: parseInt(e.target.value, 10) })}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-mono text-xs font-semibold text-slate-900 outline-none cursor-pointer"
              >
                <option value={1}>1 Retry</option>
                <option value={2}>2 Retries</option>
                <option value={3}>3 Retries</option>
                <option value={4}>4 Retries</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="mt-2 w-full py-2.5 px-4 rounded-2xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Updating...' : 'Save Routing Settings'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* 3. Node Fleet Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Mesh Topology Fleet & Node Health
          </h2>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-emerald-600 font-semibold">{summary.online_nodes} Online</span>
            <span className="text-amber-600 font-semibold">{summary.low_battery_nodes} Low Battery</span>
            <span className="text-slate-400">{summary.offline_nodes} Offline</span>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-100">
            <thead className="bg-slate-50 text-slate-500 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3">Node ID</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Name & Sector</th>
                <th className="py-3 px-3">Last Heard</th>
                <th className="py-3 px-3">Power & Battery</th>
                <th className="py-3 px-3">Signal (RSSI / SNR)</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Ping</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {nodes.map((node) => {
                const isOnline = node.status === 'online';
                const isLowBatt = node.status === 'low_battery';
                const feedback = pingFeedback[node.node_id];

                return (
                  <tr key={node.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {node.node_id}
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-mono text-[10px] uppercase font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                        {node.role}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {node.name}
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                      {node.last_heard ? node.last_heard.slice(11, 19) : '--'}
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        {node.battery_level <= 25 ? (
                          <BatteryLow className="w-4 h-4 text-amber-500" />
                        ) : (
                          <Battery className="w-4 h-4 text-emerald-600" />
                        )}
                        <span className="font-mono font-semibold text-slate-800">
                          {node.battery_level}%
                        </span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                          ({node.power_source})
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">
                      {node.rssi} dBm • SNR +{node.snr} dB
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                          isOnline
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : isLowBatt
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isOnline ? 'bg-emerald-500' : isLowBatt ? 'bg-amber-500' : 'bg-slate-400'
                          }`}
                        />
                        <span className="capitalize">{node.status.replace('_', ' ')}</span>
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {feedback && (
                          <span className="font-mono text-[10px] text-emerald-600 font-semibold animate-in fade-in">
                            {feedback}
                          </span>
                        )}
                        <button
                          onClick={() => handlePingNode(node.node_id)}
                          type="button"
                          className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 text-xs font-semibold transition-colors"
                        >
                          Ping
                        </button>
                      </div>
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
