/**
 * METHORE Dual-Mode API & Local Storage Service
 * 
 * Supports seamless switching between:
 * 1. Mock Mode (VITE_USE_MOCK=true): 100% client-side offline persistence via localStorage.
 * 2. Live API Mode (VITE_USE_MOCK=false): Direct REST calls to Node.js + SQLite backend.
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// =========================================================================
// MOCK DATASET (Safe, anonymized placeholder records)
// =========================================================================

const INITIAL_RESIDENTS = [
  {
    id: 1,
    user_id: 'RES-1042',
    device_id: 'HND-042',
    full_name: 'Morgan Santos',
    address: '42 Mabini St, Purok 2, Barangay San Isidro',
    contact_number: '+63 917 555 0142',
    medical_notes: 'Asthma, Penicillin allergy',
    is_active: 1,
    created_at: '2026-08-10T08:00:00Z',
    updated_at: '2026-10-01T10:00:00Z'
  },
  {
    id: 2,
    user_id: 'RES-1019',
    device_id: 'HND-019',
    full_name: 'Taylor Cruz',
    address: '15 Rizal Ave, Purok 3, Barangay San Isidro',
    contact_number: '+63 918 555 0119',
    medical_notes: 'Hypertension',
    is_active: 1,
    created_at: '2026-08-12T09:30:00Z',
    updated_at: '2026-09-15T11:20:00Z'
  },
  {
    id: 3,
    user_id: 'RES-1088',
    device_id: 'HND-088',
    full_name: 'Casey Navarro',
    address: '8 Bonifacio St, Purok 1, Barangay San Isidro',
    contact_number: '+63 919 555 0188',
    medical_notes: 'Diabetic (Type 2)',
    is_active: 1,
    created_at: '2026-08-15T14:15:00Z',
    updated_at: '2026-09-20T16:45:00Z'
  },
  {
    id: 4,
    user_id: 'RES-1004',
    device_id: 'HND-004',
    full_name: 'Alex Rivera',
    address: '27 Riverside Drive, Purok 5, Barangay San Isidro',
    contact_number: '+63 920 555 0104',
    medical_notes: 'None reported',
    is_active: 0, // DEACTIVATED
    created_at: '2026-07-01T10:00:00Z',
    updated_at: '2026-10-10T08:30:00Z'
  },
  {
    id: 5,
    user_id: 'RES-1055',
    device_id: 'HND-055',
    full_name: 'Sam Taylor',
    address: '62 San Isidro Way, Purok 4, Barangay San Isidro',
    contact_number: '+63 921 555 0155',
    medical_notes: 'None',
    is_active: 1,
    created_at: '2026-08-20T11:00:00Z',
    updated_at: '2026-08-20T11:00:00Z'
  },
  {
    id: 6,
    user_id: 'RES-1033',
    device_id: 'HND-033',
    full_name: 'Jordan Reyes',
    address: '10 Mabini St, Purok 2, Barangay San Isidro',
    contact_number: '+63 922 555 0133',
    medical_notes: 'Mobility impairment',
    is_active: 1,
    created_at: '2026-08-25T13:40:00Z',
    updated_at: '2026-09-10T14:00:00Z'
  }
];

const INITIAL_INCIDENTS = [
  {
    id: 1,
    incident_code: 'INC-2026-084',
    packet_hash: 'hash-res1042-medical-143205',
    user_id: 'RES-1042',
    device_id: 'HND-042',
    is_registered_flag: 1,
    emergency_type: 'medical',
    latitude: 13.9842,
    longitude: 121.0518,
    area_name: 'Purok 2 Plaza',
    gps_status: 'valid',
    report_time: '2026-10-16T14:32:05+08:00',
    receipt_time: '2026-10-16T14:32:08+08:00',
    hop_count: 2,
    rssi: -78,
    snr: 6.5,
    status: 'Responding',
    assigned_responder: 'Team Alpha — Tanod Unit 2 (Devon Cruz)',
    notes: 'Dispatched Barangay health worker and patrol tricycle to 42 Mabini St.',
    is_unread: 0,
    resident_name: 'Morgan Santos',
    resident_address: '42 Mabini St, Purok 2, Barangay San Isidro',
    resident_contact: '+63 917 555 0142',
    resident_medical_notes: 'Asthma, Penicillin allergy'
  },
  {
    id: 2,
    incident_code: 'INC-2026-085',
    packet_hash: 'hash-res1019-fire-142940',
    user_id: 'RES-1019',
    device_id: 'HND-019',
    is_registered_flag: 1,
    emergency_type: 'fire',
    latitude: 13.9855,
    longitude: 121.0530,
    area_name: 'Purok 3 Market',
    gps_status: 'valid',
    report_time: '2026-10-16T14:29:40+08:00',
    receipt_time: '2026-10-16T14:29:45+08:00',
    hop_count: 3,
    rssi: -82,
    snr: 5.1,
    status: 'New',
    assigned_responder: null,
    notes: 'Smoke spotted near public market stalls',
    is_unread: 1,
    resident_name: 'Taylor Cruz',
    resident_address: '15 Rizal Ave, Purok 3, Barangay San Isidro',
    resident_contact: '+63 918 555 0119',
    resident_medical_notes: 'Hypertension'
  },
  {
    id: 3,
    incident_code: 'INC-2026-086',
    packet_hash: 'hash-unk09-fire-141018',
    user_id: 'UNK-09',
    device_id: 'HND-999',
    is_registered_flag: 0, // UNREGISTERED DEVICE
    emergency_type: 'fire',
    latitude: 13.9821,
    longitude: 121.0502,
    area_name: 'Purok 4 Market',
    gps_status: 'valid',
    report_time: '2026-10-16T14:10:18+08:00',
    receipt_time: '2026-10-16T14:10:22+08:00',
    hop_count: 1,
    rssi: -69,
    snr: 9.2,
    status: 'New',
    assigned_responder: null,
    notes: 'Flagged report from unregistered device HND-999 (User ID: UNK-09)',
    is_unread: 1,
    resident_name: 'Unknown Citizen',
    resident_address: 'Purok 4 Market Sector',
    resident_contact: 'N/A',
    resident_medical_notes: 'None'
  },
  {
    id: 4,
    incident_code: 'INC-2026-083',
    packet_hash: 'hash-res1004-medical-190405',
    user_id: 'RES-1004',
    device_id: 'HND-004',
    is_registered_flag: 0, // DEACTIVATED ID
    emergency_type: 'medical',
    latitude: 13.9810,
    longitude: 121.0490,
    area_name: 'Purok 5 Riverside',
    gps_status: 'stale',
    report_time: '2026-10-15T19:04:05+08:00',
    receipt_time: '2026-10-15T19:04:11+08:00',
    hop_count: 2,
    rssi: -88,
    snr: 3.4,
    status: 'Acknowledged',
    assigned_responder: 'Tanod Patrol Unit 4',
    notes: 'Report from deactivated resident RES-1004 received and acknowledged',
    is_unread: 0,
    resident_name: 'Alex Rivera',
    resident_address: '27 Riverside Drive, Purok 5, Barangay San Isidro',
    resident_contact: '+63 920 555 0104',
    resident_medical_notes: 'None reported'
  },
  {
    id: 5,
    incident_code: 'INC-2026-082',
    packet_hash: 'hash-res1088-crime-162012',
    user_id: 'RES-1088',
    device_id: 'HND-088',
    is_registered_flag: 1,
    emergency_type: 'crime',
    latitude: 13.9830,
    longitude: 121.0510,
    area_name: 'Purok 1 Hallway',
    gps_status: 'valid',
    report_time: '2026-10-15T16:20:12+08:00',
    receipt_time: '2026-10-15T16:20:15+08:00',
    hop_count: 1,
    rssi: -71,
    snr: 8.0,
    status: 'Resolved',
    assigned_responder: 'Tanod Unit 1',
    notes: 'Suspicious intrusion investigated and cleared',
    is_unread: 0,
    resident_name: 'Casey Navarro',
    resident_address: '8 Bonifacio St, Purok 1, Barangay San Isidro',
    resident_contact: '+63 919 555 0188',
    resident_medical_notes: 'Diabetic (Type 2)'
  },
  {
    id: 6,
    incident_code: 'INC-2026-081',
    packet_hash: 'hash-res1055-traffic-111500',
    user_id: 'RES-1055',
    device_id: 'HND-055',
    is_registered_flag: 1,
    emergency_type: 'traffic_accident',
    latitude: 13.9860,
    longitude: 121.0545,
    area_name: 'Highway Crossing',
    gps_status: 'valid',
    report_time: '2026-10-15T11:15:00+08:00',
    receipt_time: '2026-10-15T11:15:04+08:00',
    hop_count: 2,
    rssi: -75,
    snr: 7.2,
    status: 'Resolved',
    assigned_responder: 'Barangay Rescue 1',
    notes: 'Minor motorcycle collision, first aid rendered',
    is_unread: 0,
    resident_name: 'Sam Taylor',
    resident_address: '62 San Isidro Way, Purok 4, Barangay San Isidro',
    resident_contact: '+63 921 555 0155',
    resident_medical_notes: 'None'
  }
];

const INITIAL_LOGS = [
  { id: 1, incident_id: 1, previous_status: null, new_status: 'New', changed_by_name: 'METHORE LoRa Gateway', changed_by_role: 'system', note: 'Emergency SOS packet decoded via 2-hop mesh path.', timestamp: '2026-10-16T14:32:08+08:00' },
  { id: 2, incident_id: 1, previous_status: 'New', new_status: 'Acknowledged', changed_by_name: 'Alex Rivera', changed_by_role: 'official', note: 'Station acknowledged emergency transmission. Radio alert tone triggered.', timestamp: '2026-10-16T14:32:30+08:00' },
  { id: 3, incident_id: 1, previous_status: 'Acknowledged', new_status: 'Responding', changed_by_name: 'Alex Rivera', changed_by_role: 'official', note: 'Status changed to Responding by Alex Rivera (Barangay Official). Tanod Unit 2 en route.', timestamp: '2026-10-16T14:34:10+08:00' },
  { id: 4, incident_id: 2, previous_status: null, new_status: 'New', changed_by_name: 'METHORE LoRa Gateway', changed_by_role: 'system', note: 'Fire alert packet received via 3 hops.', timestamp: '2026-10-16T14:29:45+08:00' },
  { id: 5, incident_id: 3, previous_status: null, new_status: 'New', changed_by_name: 'METHORE LoRa Gateway', changed_by_role: 'system', note: 'Report from unknown hardware safely logged with is_registered_flag=0.', timestamp: '2026-10-16T14:10:22+08:00' }
];

const INITIAL_NODES = [
  { id: 1, node_id: 'STN-01', name: 'Barangay Hall Station (Gateway)', role: 'station', last_heard: '2026-10-16T14:32:08Z', battery_level: 100, power_source: 'Mains + Battery Backup', rssi: -45, snr: 12.0, status: 'online' },
  { id: 2, node_id: 'REL-01', name: 'Purok 2 Plaza Relay', role: 'relay', last_heard: '2026-10-16T14:30:00Z', battery_level: 92, power_source: 'Solar + LiFePO4', rssi: -72, snr: 8.5, status: 'online' },
  { id: 3, node_id: 'REL-02', name: 'Purok 4 School Tower Relay', role: 'relay', last_heard: '2026-10-16T14:28:00Z', battery_level: 85, power_source: 'Solar + LiFePO4', rssi: -78, snr: 6.8, status: 'online' },
  { id: 4, node_id: 'REL-03', name: 'Boundary Hilltop Relay', role: 'relay', last_heard: '2026-10-16T14:25:00Z', battery_level: 22, power_source: 'Solar + LiPo', rssi: -89, snr: 3.2, status: 'low_battery' },
  { id: 5, node_id: 'REL-04', name: 'Riverside Outpost Relay', role: 'relay', last_heard: '2026-10-15T18:00:00Z', battery_level: 0, power_source: 'Solar + LiPo', rssi: -105, snr: -2.0, status: 'offline' },
  { id: 6, node_id: 'HND-042', name: 'Morgan Santos Handheld', role: 'handheld', last_heard: '2026-10-16T14:32:05Z', battery_level: 88, power_source: 'Li-Ion 18650', rssi: -78, snr: 6.5, status: 'online' },
  { id: 7, node_id: 'HND-019', name: 'Taylor Cruz Handheld', role: 'handheld', last_heard: '2026-10-16T14:29:40Z', battery_level: 74, power_source: 'Li-Ion 18650', rssi: -82, snr: 5.1, status: 'online' }
];

const INITIAL_SETTINGS = {
  id: 1,
  serial_port: 'COM4',
  is_connected: 1,
  last_packet_time: '2026-10-16T14:32:08+08:00',
  channel_name: 'METHORE-BRGY-CH0',
  hop_limit: 3,
  retry_limit: 3,
  duplicates_discarded: 18
};

const INITIAL_SESSIONS = [
  {
    id: 1,
    session_name: 'Scenario B: 3-Hop Heavy Foliage Test',
    is_active: 1,
    started_at: '2026-10-16T13:00:00+08:00',
    ended_at: null,
    created_by: 'Sam Taylor'
  }
];

const INITIAL_TEST_LOGS = Array.from({ length: 50 }, (_, i) => {
  const isDelivered = i !== 14 && i !== 38; // 48 delivered, 2 lost = 96% MDR
  const hop = i < 20 ? 1 : i < 38 ? 2 : 3;
  const delay = Number((1.4 + (hop * 1.3) + (i % 6) * 0.25).toFixed(2));
  return {
    id: i + 1,
    session_id: 1,
    packet_id: `PKT-TEST-${String(i + 1).padStart(3, '0')}`,
    send_time: `2026-10-16T13:${String(Math.floor(i / 2)).padStart(2, '0')}:00Z`,
    receive_time: isDelivered ? `2026-10-16T13:${String(Math.floor(i / 2)).padStart(2, '0')}:0${Math.floor(delay)}Z` : null,
    delay_seconds: isDelivered ? delay : null,
    hop_count: hop,
    rssi: isDelivered ? -70 - (hop * 7) : null,
    snr: isDelivered ? Number((9 - hop * 1.5).toFixed(1)) : null,
    outcome: isDelivered ? 'Delivered' : 'Lost'
  };
});

// =========================================================================
// LOCALSTORAGE HELPER METHODS
// =========================================================================

function getStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(`methore_${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage(key, value) {
  try {
    localStorage.setItem(`methore_${key}`, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

/**
 * Restores initial demo dataset in localStorage
 */
export function resetDemoData() {
  setStorage('residents', INITIAL_RESIDENTS);
  setStorage('incidents', INITIAL_INCIDENTS);
  setStorage('logs', INITIAL_LOGS);
  setStorage('nodes', INITIAL_NODES);
  setStorage('settings', INITIAL_SETTINGS);
  setStorage('sessions', INITIAL_SESSIONS);
  setStorage('test_logs', INITIAL_TEST_LOGS);

  // Dispatch custom event for UI components to immediately re-render
  window.dispatchEvent(new CustomEvent('methore_data_reset'));
  return true;
}

// Pre-seed storage if missing
if (!localStorage.getItem('methore_residents')) {
  resetDemoData();
}

// Simple deterministic hash
function computeSimpleHash(userId, type, reportTime) {
  return `${String(userId).trim()}-${String(type).trim()}-${String(reportTime).trim()}`;
}

// =========================================================================
// DUAL-MODE API METHODS
// =========================================================================

export const api = {
  isMockMode: () => USE_MOCK,

  // -----------------------------------------------------------------------
  // AUTH
  // -----------------------------------------------------------------------
  auth: {
    async login(username, password) {
      if (USE_MOCK) {
        const u = username.toLowerCase().trim();
        const demoAccounts = {
          'alex.rivera': { id: 1, username: 'alex.rivera', full_name: 'Alex Rivera', role: 'official' },
          'jordan.reyes': { id: 2, username: 'jordan.reyes', full_name: 'Jordan Reyes', role: 'administrator' },
          'sam.taylor': { id: 3, username: 'sam.taylor', full_name: 'Sam Taylor', role: 'researcher' }
        };
        const user = demoAccounts[u] || { id: 99, username: u, full_name: username, role: 'official' };
        return {
          status: 'success',
          token: `mock-token-${u}-${Date.now()}`,
          user
        };
      }

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Login failed');
      }
      return res.json();
    }
  },

  // -----------------------------------------------------------------------
  // INCIDENTS
  // -----------------------------------------------------------------------
  incidents: {
    async getAll(params = {}) {
      if (USE_MOCK) {
        let list = getStorage('incidents', INITIAL_INCIDENTS);
        const { search, emergency_type, status, date_from, date_to, sort } = params;

        if (search && search.trim()) {
          const s = search.toLowerCase();
          list = list.filter(i => 
            (i.incident_code || '').toLowerCase().includes(s) ||
            (i.user_id || '').toLowerCase().includes(s) ||
            (i.device_id || '').toLowerCase().includes(s) ||
            (i.area_name || '').toLowerCase().includes(s) ||
            (i.resident_name || '').toLowerCase().includes(s)
          );
        }

        if (emergency_type && emergency_type !== 'all') {
          const normType = emergency_type === 'traffic' ? 'traffic_accident' : emergency_type;
          list = list.filter(i => i.emergency_type === normType);
        }

        if (status && status !== 'all') {
          list = list.filter(i => i.status.toLowerCase() === status.toLowerCase());
        }

        if (date_from) {
          list = list.filter(i => i.receipt_time >= date_from);
        }
        if (date_to) {
          list = list.filter(i => i.receipt_time <= date_to);
        }

        if (sort === 'oldest') {
          list.sort((a, b) => a.receipt_time.localeCompare(b.receipt_time));
        } else if (sort === 'status') {
          list.sort((a, b) => a.status.localeCompare(b.status));
        } else {
          list.sort((a, b) => b.receipt_time.localeCompare(a.receipt_time));
        }

        const allIncidents = getStorage('incidents', INITIAL_INCIDENTS);
        const counts = {
          all: allIncidents.length,
          new: allIncidents.filter(i => i.status === 'New').length,
          acknowledged: allIncidents.filter(i => i.status === 'Acknowledged').length,
          responding: allIncidents.filter(i => i.status === 'Responding').length,
          resolved: allIncidents.filter(i => i.status === 'Resolved').length,
          false_alarm: allIncidents.filter(i => i.status.toLowerCase().includes('false')).length,
          unread: allIncidents.filter(i => i.is_unread === 1).length,
          flagged: allIncidents.filter(i => i.is_registered_flag === 0).length
        };

        return {
          status: 'success',
          counts,
          total: list.length,
          incidents: list
        };
      }

      const q = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/incidents?${q}`);
      if (!res.ok) throw new Error('Failed to fetch incidents');
      return res.json();
    },

    async getById(id) {
      if (USE_MOCK) {
        const incidents = getStorage('incidents', INITIAL_INCIDENTS);
        const logs = getStorage('logs', INITIAL_LOGS);
        const residents = getStorage('residents', INITIAL_RESIDENTS);

        const inc = incidents.find(i => String(i.id) === String(id) || i.incident_code === id);
        if (!inc) throw new Error('Incident not found');

        const incLogs = logs.filter(l => l.incident_id === inc.id).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
        const res = residents.find(r => r.user_id === inc.user_id);

        return {
          status: 'success',
          incident: {
            ...inc,
            resident: res || {
              user_id: inc.user_id,
              device_id: inc.device_id,
              full_name: inc.resident_name || (inc.is_registered_flag === 1 ? 'Registered Citizen' : 'Unknown Resident'),
              address: inc.resident_address || inc.area_name,
              contact_number: inc.resident_contact || 'N/A',
              medical_notes: inc.resident_medical_notes || 'None recorded',
              is_active: inc.is_registered_flag
            },
            logs: incLogs
          }
        };
      }

      const res = await fetch(`${API_BASE}/incidents/${id}`);
      if (!res.ok) throw new Error('Incident not found');
      return res.json();
    },

    async updateStatus(id, { status, changed_by_name, changed_by_role, note }) {
      if (USE_MOCK) {
        const incidents = getStorage('incidents', INITIAL_INCIDENTS);
        const logs = getStorage('logs', INITIAL_LOGS);

        const index = incidents.findIndex(i => String(i.id) === String(id) || i.incident_code === id);
        if (index === -1) throw new Error('Incident not found');

        const prev = incidents[index].status;
        incidents[index].status = status;
        incidents[index].is_unread = 0;
        setStorage('incidents', incidents);

        const newLog = {
          id: Date.now(),
          incident_id: incidents[index].id,
          previous_status: prev,
          new_status: status,
          changed_by_name: changed_by_name || 'Alex Rivera',
          changed_by_role: changed_by_role || 'official',
          note: note || `Status updated from ${prev} to ${status}.`,
          timestamp: new Date().toISOString()
        };
        logs.push(newLog);
        setStorage('logs', logs);

        return {
          status: 'success',
          incident: incidents[index],
          logs: logs.filter(l => l.incident_id === incidents[index].id)
        };
      }

      const res = await fetch(`${API_BASE}/incidents/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, changed_by_name, changed_by_role, note })
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },

    async updateNotes(id, { assigned_responder, notes, changed_by_name, changed_by_role }) {
      if (USE_MOCK) {
        const incidents = getStorage('incidents', INITIAL_INCIDENTS);
        const logs = getStorage('logs', INITIAL_LOGS);

        const index = incidents.findIndex(i => String(i.id) === String(id) || i.incident_code === id);
        if (index === -1) throw new Error('Incident not found');

        if (assigned_responder !== undefined) incidents[index].assigned_responder = assigned_responder;
        if (notes !== undefined) incidents[index].notes = notes;
        incidents[index].is_unread = 0;
        setStorage('incidents', incidents);

        if (notes) {
          logs.push({
            id: Date.now(),
            incident_id: incidents[index].id,
            previous_status: incidents[index].status,
            new_status: incidents[index].status,
            changed_by_name: changed_by_name || 'Alex Rivera',
            changed_by_role: changed_by_role || 'official',
            note: `Note logged: "${notes}"`,
            timestamp: new Date().toISOString()
          });
          setStorage('logs', logs);
        }

        return {
          status: 'success',
          incident: incidents[index],
          logs: logs.filter(l => l.incident_id === incidents[index].id)
        };
      }

      const res = await fetch(`${API_BASE}/incidents/${id}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigned_responder, notes, changed_by_name, changed_by_role })
      });
      if (!res.ok) throw new Error('Failed to update notes');
      return res.json();
    },

    getExportCsvUrl(params = {}) {
      if (USE_MOCK) {
        // In mock mode, generates data URI for instantaneous offline download
        const incidents = getStorage('incidents', INITIAL_INCIDENTS);
        const headers = ['Incident Code', 'Report Time', 'Receipt Time', 'Emergency Type', 'Status', 'Resident Name', 'User ID', 'Device ID', 'Area Name', 'GPS Status', 'Hops', 'RSSI'];
        const rows = incidents.map(i => [
          i.incident_code,
          i.report_time,
          i.receipt_time,
          i.emergency_type,
          i.status,
          `"${(i.resident_name || '').replace(/"/g, '""')}"`,
          i.user_id,
          i.device_id,
          `"${(i.area_name || '').replace(/"/g, '""')}"`,
          i.gps_status,
          i.hop_count,
          i.rssi
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
        return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
      }

      const q = new URLSearchParams(params).toString();
      return `${API_BASE}/incidents/export/csv?${q}`;
    }
  },

  // -----------------------------------------------------------------------
  // PACKETS (USB INGEST & SIMULATION)
  // -----------------------------------------------------------------------
  packets: {
    async ingest(packet) {
      if (USE_MOCK) {
        const incidents = getStorage('incidents', INITIAL_INCIDENTS);
        const residents = getStorage('residents', INITIAL_RESIDENTS);
        const settings = getStorage('settings', INITIAL_SETTINGS);
        const logs = getStorage('logs', INITIAL_LOGS);

        const packetHash = computeSimpleHash(packet.user_id, packet.emergency_type, packet.report_time);

        // 1. DUPLICATE SUPPRESSION
        const duplicate = incidents.find(i => i.packet_hash === packetHash);
        if (duplicate) {
          settings.duplicates_discarded += 1;
          settings.last_packet_time = packet.receipt_time || new Date().toISOString();
          setStorage('settings', settings);

          return {
            status: 'success',
            duplicate: true,
            acknowledged: true,
            incident_code: duplicate.incident_code,
            message: 'Duplicate packet suppressed via multi-hop path',
            duplicates_discarded: settings.duplicates_discarded
          };
        }

        // 2. UNREGISTERED / DEACTIVATED ID FLAGGING
        const resident = residents.find(r => r.user_id === packet.user_id);
        const isRegistered = Boolean(resident && resident.is_active === 1);
        const isRegisteredFlag = isRegistered ? 1 : 0;

        const codeNum = String(incidents.length + 85).padStart(3, '0');
        const incidentCode = `INC-${new Date().getFullYear()}-${codeNum}`;
        const now = packet.receipt_time || new Date().toISOString();

        const newIncident = {
          id: Date.now(),
          incident_code: incidentCode,
          packet_hash: packetHash,
          user_id: packet.user_id,
          device_id: packet.device_id,
          is_registered_flag: isRegisteredFlag,
          emergency_type: packet.emergency_type === 'traffic' ? 'traffic_accident' : packet.emergency_type,
          latitude: Number(packet.latitude) || 13.9842,
          longitude: Number(packet.longitude) || 121.0518,
          area_name: packet.area_name || 'Barangay San Isidro Sector',
          gps_status: packet.gps_status || 'valid',
          report_time: packet.report_time || now,
          receipt_time: now,
          hop_count: parseInt(packet.hop_count, 10) || 1,
          rssi: parseInt(packet.rssi, 10) || -75,
          snr: parseFloat(packet.snr) || 6.0,
          status: 'New',
          assigned_responder: null,
          notes: packet.notes || (isRegistered ? 'SOS packet received via LoRa mesh' : 'Flagged report from unlinked device'),
          is_unread: 1,
          resident_name: resident ? resident.full_name : 'Unknown Resident',
          resident_address: resident ? resident.address : packet.area_name,
          resident_contact: resident ? resident.contact_number : 'N/A',
          resident_medical_notes: resident ? resident.medical_notes : 'None'
        };

        incidents.unshift(newIncident);
        setStorage('incidents', incidents);

        // Add log
        logs.push({
          id: Date.now() + 1,
          incident_id: newIncident.id,
          previous_status: null,
          new_status: 'New',
          changed_by_name: 'METHORE LoRa Gateway',
          changed_by_role: 'system',
          note: isRegistered ? 'Emergency SOS packet decoded via LoRa mesh' : 'Flagged unlinked device packet logged',
          timestamp: now
        });
        setStorage('logs', logs);

        settings.last_packet_time = now;
        setStorage('settings', settings);

        return {
          status: 'success',
          duplicate: false,
          acknowledged: true,
          incident_id: newIncident.id,
          incident_code: incidentCode,
          is_registered_flag: isRegisteredFlag,
          ack_payload: {
            ack_id: `ACK-${Math.floor(1000 + Math.random() * 9000)}`,
            timestamp: now,
            gateway_node: 'STN-01',
            haptic_pulses: 2,
            delivery_status: 'Delivered to Barangay Station'
          }
        };
      }

      const res = await fetch(`${API_BASE}/packets/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packet)
      });
      if (!res.ok) throw new Error('Failed to ingest packet');
      return res.json();
    }
  },

  // -----------------------------------------------------------------------
  // RESIDENTS
  // -----------------------------------------------------------------------
  residents: {
    async getAll(params = {}) {
      if (USE_MOCK) {
        let list = getStorage('residents', INITIAL_RESIDENTS);
        const { search, status } = params;

        if (search && search.trim()) {
          const s = search.toLowerCase();
          list = list.filter(r => 
            r.user_id.toLowerCase().includes(s) ||
            r.device_id.toLowerCase().includes(s) ||
            r.full_name.toLowerCase().includes(s) ||
            r.address.toLowerCase().includes(s)
          );
        }

        if (status === 'active') {
          list = list.filter(r => r.is_active === 1);
        } else if (status === 'deactivated') {
          list = list.filter(r => r.is_active === 0);
        }

        const allResidents = getStorage('residents', INITIAL_RESIDENTS);
        const incidents = getStorage('incidents', INITIAL_INCIDENTS);

        return {
          status: 'success',
          summary: {
            total: allResidents.length,
            active: allResidents.filter(r => r.is_active === 1).length,
            deactivated: allResidents.filter(r => r.is_active === 0).length,
            flaggedReports: incidents.filter(i => i.is_registered_flag === 0).length
          },
          count: list.length,
          residents: list
        };
      }

      const q = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/residents?${q}`);
      if (!res.ok) throw new Error('Failed to fetch residents');
      return res.json();
    },

    async getFlaggedReports() {
      if (USE_MOCK) {
        const incidents = getStorage('incidents', INITIAL_INCIDENTS);
        const flagged = incidents.filter(i => i.is_registered_flag === 0);
        return {
          status: 'success',
          count: flagged.length,
          reports: flagged
        };
      }

      const res = await fetch(`${API_BASE}/residents/flagged-reports`);
      if (!res.ok) throw new Error('Failed to fetch flagged reports');
      return res.json();
    },

    async create(data) {
      if (USE_MOCK) {
        const residents = getStorage('residents', INITIAL_RESIDENTS);
        const uid = data.user_id.trim().toUpperCase();
        const did = data.device_id.trim().toUpperCase();

        if (residents.some(r => r.user_id === uid)) {
          const err = new Error(`User ID '${uid}' is already registered`);
          err.status = 409;
          throw err;
        }

        if (residents.some(r => r.device_id === did)) {
          const err = new Error(`Device ID '${did}' is already assigned`);
          err.status = 409;
          throw err;
        }

        const newResident = {
          id: Date.now(),
          user_id: uid,
          device_id: did,
          full_name: data.full_name.trim(),
          address: data.address.trim(),
          contact_number: (data.contact_number || '').trim(),
          medical_notes: (data.medical_notes || '').trim(),
          is_active: data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        residents.unshift(newResident);
        setStorage('residents', residents);

        return {
          status: 'success',
          message: 'Resident registered successfully',
          resident: newResident
        };
      }

      const res = await fetch(`${API_BASE}/residents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to register resident');
      }
      return res.json();
    },

    async update(id, data) {
      if (USE_MOCK) {
        const residents = getStorage('residents', INITIAL_RESIDENTS);
        const index = residents.findIndex(r => String(r.id) === String(id));
        if (index === -1) throw new Error('Resident not found');

        const uid = (data.user_id || residents[index].user_id).trim().toUpperCase();
        const did = (data.device_id || residents[index].device_id).trim().toUpperCase();

        if (residents.some(r => r.user_id === uid && String(r.id) !== String(id))) {
          const err = new Error(`User ID '${uid}' is already registered`);
          err.status = 409;
          throw err;
        }

        if (residents.some(r => r.device_id === did && String(r.id) !== String(id))) {
          const err = new Error(`Device ID '${did}' is already assigned`);
          err.status = 409;
          throw err;
        }

        residents[index] = {
          ...residents[index],
          ...data,
          user_id: uid,
          device_id: did,
          updated_at: new Date().toISOString()
        };
        setStorage('residents', residents);

        return {
          status: 'success',
          resident: residents[index]
        };
      }

      const res = await fetch(`${API_BASE}/residents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update resident');
      }
      return res.json();
    },

    async toggleStatus(id, isActive) {
      if (USE_MOCK) {
        const residents = getStorage('residents', INITIAL_RESIDENTS);
        const index = residents.findIndex(r => String(r.id) === String(id));
        if (index === -1) throw new Error('Resident not found');

        residents[index].is_active = isActive ? 1 : 0;
        residents[index].updated_at = new Date().toISOString();
        setStorage('residents', residents);

        return {
          status: 'success',
          resident: residents[index]
        };
      }

      const res = await fetch(`${API_BASE}/residents/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive })
      });
      if (!res.ok) throw new Error('Failed to toggle status');
      return res.json();
    }
  },

  // -----------------------------------------------------------------------
  // NETWORK
  // -----------------------------------------------------------------------
  network: {
    async getStatus() {
      if (USE_MOCK) {
        const settings = getStorage('settings', INITIAL_SETTINGS);
        const nodes = getStorage('nodes', INITIAL_NODES);
        return {
          status: 'success',
          settings,
          nodes,
          summary: {
            total_nodes: nodes.length,
            online_nodes: nodes.filter(n => n.status === 'online').length,
            low_battery_nodes: nodes.filter(n => n.status === 'low_battery').length,
            offline_nodes: nodes.filter(n => n.status === 'offline').length
          }
        };
      }

      const res = await fetch(`${API_BASE}/network/status`);
      if (!res.ok) throw new Error('Failed to fetch network status');
      return res.json();
    },

    async updateSettings(newSettings) {
      if (USE_MOCK) {
        const current = getStorage('settings', INITIAL_SETTINGS);
        const updated = { ...current, ...newSettings };
        setStorage('settings', updated);
        return { status: 'success', settings: updated };
      }

      const res = await fetch(`${API_BASE}/network/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      if (!res.ok) throw new Error('Failed to update network settings');
      return res.json();
    },

    async pingNode(nodeId) {
      if (USE_MOCK) {
        const nodes = getStorage('nodes', INITIAL_NODES);
        const node = nodes.find(n => n.node_id === nodeId || String(n.id) === String(nodeId));
        if (!node) throw new Error('Node not found');

        node.last_heard = new Date().toISOString();
        if (node.status === 'offline' && node.battery_level > 0) node.status = 'online';
        setStorage('nodes', nodes);

        return {
          status: 'success',
          ping_telemetry: {
            node_id: node.node_id,
            latency_ms: Math.floor(35 + Math.random() * 45),
            rssi: node.rssi,
            snr: node.snr,
            battery_level: node.battery_level,
            status: node.status
          }
        };
      }

      const res = await fetch(`${API_BASE}/network/nodes/${nodeId}/ping`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to ping node');
      return res.json();
    }
  },

  // -----------------------------------------------------------------------
  // EVALUATION TEST LAB
  // -----------------------------------------------------------------------
  evaluation: {
    async getSessions() {
      if (USE_MOCK) {
        const sessions = getStorage('sessions', INITIAL_SESSIONS);
        const testLogs = getStorage('test_logs', INITIAL_TEST_LOGS);

        const mapped = sessions.map(s => {
          const sessionLogs = testLogs.filter(l => l.session_id === s.id);
          const delivered = sessionLogs.filter(l => l.outcome === 'Delivered').length;
          const total = sessionLogs.length;
          return {
            ...s,
            total_packets: total,
            delivered_packets: delivered,
            lost_packets: total - delivered,
            mdr_percent: total > 0 ? Number(((delivered / total) * 100).toFixed(1)) : 0
          };
        });

        return { status: 'success', count: mapped.length, sessions: mapped };
      }

      const res = await fetch(`${API_BASE}/evaluation/sessions`);
      if (!res.ok) throw new Error('Failed to fetch sessions');
      return res.json();
    },

    async createSession({ session_name, created_by }) {
      if (USE_MOCK) {
        const sessions = getStorage('sessions', INITIAL_SESSIONS);
        sessions.forEach(s => s.is_active = 0);

        const newSession = {
          id: Date.now(),
          session_name: session_name.trim(),
          is_active: 1,
          started_at: new Date().toISOString(),
          ended_at: null,
          created_by: created_by || 'Sam Taylor'
        };

        sessions.unshift(newSession);
        setStorage('sessions', sessions);
        return { status: 'success', session: newSession };
      }

      const res = await fetch(`${API_BASE}/evaluation/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_name, created_by })
      });
      if (!res.ok) throw new Error('Failed to create session');
      return res.json();
    },

    async stopSession(id) {
      if (USE_MOCK) {
        const sessions = getStorage('sessions', INITIAL_SESSIONS);
        const s = sessions.find(session => String(session.id) === String(id));
        if (s) {
          s.is_active = 0;
          s.ended_at = new Date().toISOString();
          setStorage('sessions', sessions);
        }
        return { status: 'success', session: s };
      }

      const res = await fetch(`${API_BASE}/evaluation/sessions/${id}/stop`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to stop session');
      return res.json();
    },

    async recordPacket(packet) {
      if (USE_MOCK) {
        const testLogs = getStorage('test_logs', INITIAL_TEST_LOGS);
        const newLog = {
          id: Date.now(),
          session_id: packet.session_id,
          packet_id: packet.packet_id || `PKT-TEST-${testLogs.length + 1}`,
          send_time: packet.send_time || new Date().toISOString(),
          receive_time: packet.receive_time,
          delay_seconds: packet.delay_seconds,
          hop_count: packet.hop_count || 1,
          rssi: packet.rssi,
          snr: packet.snr,
          outcome: packet.outcome || 'Delivered'
        };

        testLogs.push(newLog);
        setStorage('test_logs', testLogs);
        return { status: 'success', test_packet: newLog };
      }

      const res = await fetch(`${API_BASE}/evaluation/packets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packet)
      });
      if (!res.ok) throw new Error('Failed to record test packet');
      return res.json();
    },

    async getMetrics(sessionId) {
      if (USE_MOCK) {
        const sessions = getStorage('sessions', INITIAL_SESSIONS);
        const testLogs = getStorage('test_logs', INITIAL_TEST_LOGS);

        const s = sessions.find(item => String(item.id) === String(sessionId));
        const logs = testLogs.filter(l => String(l.session_id) === String(sessionId));

        const totalSent = logs.length;
        const delivered = logs.filter(l => l.outcome === 'Delivered');
        const totalDelivered = delivered.length;
        const totalLost = totalSent - totalDelivered;
        const mdr = totalSent > 0 ? Number(((totalDelivered / totalSent) * 100).toFixed(1)) : 0;

        const delays = delivered.map(l => l.delay_seconds).filter(d => d !== null && d !== undefined);
        const avgDelay = delays.length > 0 ? Number((delays.reduce((a, b) => a + b, 0) / delays.length).toFixed(1)) : 0;
        const minDelay = delays.length > 0 ? Number(Math.min(...delays).toFixed(1)) : 0;
        const maxDelay = delays.length > 0 ? Number(Math.max(...delays).toFixed(1)) : 0;

        const hopStats = {};
        for (let h = 1; h <= 4; h++) {
          const hopLogs = logs.filter(l => l.hop_count === h);
          const hopDelivered = hopLogs.filter(l => l.outcome === 'Delivered');
          const hopDelays = hopDelivered.map(l => l.delay_seconds).filter(d => d !== null);
          hopStats[`${h}_hop`] = {
            hop_count: h,
            sent: hopLogs.length,
            delivered: hopDelivered.length,
            lost: hopLogs.length - hopDelivered.length,
            mdr_percent: hopLogs.length > 0 ? Number(((hopDelivered.length / hopLogs.length) * 100).toFixed(1)) : 0,
            avg_delay_seconds: hopDelays.length > 0 ? Number((hopDelays.reduce((a, b) => a + b, 0) / hopDelays.length).toFixed(1)) : 0
          };
        }

        return {
          status: 'success',
          session: s,
          metrics: {
            total_sent: totalSent,
            total_delivered: totalDelivered,
            total_lost: totalLost,
            mdr_percent: mdr,
            avg_delay_seconds: avgDelay,
            min_delay_seconds: minDelay,
            max_delay_seconds: maxDelay,
            hop_breakdown: hopStats
          }
        };
      }

      const res = await fetch(`${API_BASE}/evaluation/sessions/${sessionId}/metrics`);
      if (!res.ok) throw new Error('Failed to fetch metrics');
      return res.json();
    },

    getExportCsvUrl(sessionId) {
      if (USE_MOCK) {
        const testLogs = getStorage('test_logs', INITIAL_TEST_LOGS);
        const logs = testLogs.filter(l => String(l.session_id) === String(sessionId));
        const headers = ['Packet ID', 'Outcome', 'Hop Count', 'Delay (s)', 'RSSI (dBm)', 'SNR (dB)', 'Send Time', 'Receive Time'];
        const rows = logs.map(l => [
          l.packet_id,
          l.outcome,
          l.hop_count,
          l.delay_seconds || 'N/A',
          l.rssi || 'N/A',
          l.snr || 'N/A',
          l.send_time,
          l.receive_time || 'N/A'
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
        return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
      }

      return `${API_BASE}/evaluation/sessions/${sessionId}/export/csv`;
    }
  }
};

export default api;
