/**
 * METHORE Dual-Mode API & Local Storage Service
 * Seed Version: methore_mock_v3
 * 
 * Supports seamless switching between:
 * 1. Mock Mode (VITE_USE_MOCK=true): 100% client-side offline persistence via localStorage.
 * 2. Live API Mode (VITE_USE_MOCK=false): Direct REST calls to Node.js + SQLite backend with mock fallback.
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const SEED_VERSION_KEY = 'methore_mock_version';
const CURRENT_SEED_VERSION = 'methore_mock_v3';

// =========================================================================
// MOCK DATASET
// =========================================================================

export const INITIAL_RESIDENTS = [
  {
    id: 1,
    user_id: 'RES-1001',
    device_id: 'HND-001',
    full_name: 'Maria Santos',
    address: '12 Mabini St, Purok 2, Barangay San Isidro',
    contact_number: '+63 917 555 0101',
    medical_notes: 'Hypertension',
    is_active: 1,
    created_at: '2026-08-01T08:00:00Z',
    updated_at: '2026-10-01T10:00:00Z'
  },
  {
    id: 2,
    user_id: 'RES-1002',
    device_id: 'HND-002',
    full_name: 'Juan Dela Cruz',
    address: '24 Rizal Ave, Purok 3, Barangay San Isidro',
    contact_number: '+63 918 555 0102',
    medical_notes: 'Diabetic (Type 2)',
    is_active: 1,
    created_at: '2026-08-02T09:00:00Z',
    updated_at: '2026-09-15T11:00:00Z'
  },
  {
    id: 3,
    user_id: 'RES-1003',
    device_id: 'HND-003',
    full_name: 'Rosa Garcia',
    address: '5 Bonifacio St, Purok 1, Barangay San Isidro',
    contact_number: '+63 919 555 0103',
    medical_notes: 'None reported',
    is_active: 1,
    created_at: '2026-08-05T10:00:00Z',
    updated_at: '2026-09-20T12:00:00Z'
  },
  {
    id: 4,
    user_id: 'RES-1004',
    device_id: 'HND-004',
    full_name: 'Alex Rivera',
    address: '27 Riverside Dr, Purok 5, Barangay San Isidro',
    contact_number: '+63 920 555 0104',
    medical_notes: 'Cardiac condition, Aspirin regimen',
    is_active: 0, // DEACTIVATED - used in flagged report!
    created_at: '2026-07-01T10:00:00Z',
    updated_at: '2026-10-10T08:30:00Z'
  },
  {
    id: 5,
    user_id: 'RES-1005',
    device_id: 'HND-005',
    full_name: 'Fernando Lim',
    address: '88 San Isidro Way, Purok 4, Barangay San Isidro',
    contact_number: '+63 921 555 0105',
    medical_notes: 'Mobility impairment (uses wheelchair)',
    is_active: 1,
    created_at: '2026-08-10T11:00:00Z',
    updated_at: '2026-08-10T11:00:00Z'
  },
  {
    id: 6,
    user_id: 'RES-1006',
    device_id: 'HND-006',
    full_name: 'Teresa Aquino',
    address: '19 Bonifacio St, Purok 1, Barangay San Isidro',
    contact_number: '+63 922 555 0106',
    medical_notes: 'Severe bee sting allergy (EpiPen carrier)',
    is_active: 1,
    created_at: '2026-08-15T13:00:00Z',
    updated_at: '2026-09-10T14:00:00Z'
  },
  {
    id: 7,
    user_id: 'RES-1007',
    device_id: 'HND-007',
    full_name: 'Elena Morales',
    address: '33 Mabini St, Purok 2, Barangay San Isidro',
    contact_number: '+63 923 555 0107',
    medical_notes: 'None reported',
    is_active: 1,
    created_at: '2026-08-18T14:00:00Z',
    updated_at: '2026-09-01T10:00:00Z'
  },
  {
    id: 8,
    user_id: 'RES-1008',
    device_id: 'HND-008',
    full_name: 'Gabriel Ocampo',
    address: '74 River Road, Purok 5, Barangay San Isidro',
    contact_number: '+63 924 555 0108',
    medical_notes: 'Mild hearing impairment',
    is_active: 0, // DEACTIVATED
    created_at: '2026-08-20T15:00:00Z',
    updated_at: '2026-10-05T09:00:00Z'
  },
  {
    id: 9,
    user_id: 'RES-1009',
    device_id: 'HND-009',
    full_name: 'Taylor Cruz',
    address: '15 Rizal Ave, Purok 3, Barangay San Isidro',
    contact_number: '+63 925 555 0109',
    medical_notes: 'Hypertension',
    is_active: 1,
    created_at: '2026-08-22T09:30:00Z',
    updated_at: '2026-09-15T11:20:00Z'
  },
  {
    id: 10,
    user_id: 'RES-1010',
    device_id: 'HND-010',
    full_name: 'Casey Navarro',
    address: '8 Bonifacio St, Purok 1, Barangay San Isidro',
    contact_number: '+63 926 555 0110',
    medical_notes: 'Diabetic (Type 2)',
    is_active: 1,
    created_at: '2026-08-25T14:15:00Z',
    updated_at: '2026-09-20T16:45:00Z'
  },
  {
    id: 11,
    user_id: 'RES-1011',
    device_id: 'HND-011',
    full_name: 'Sam Taylor',
    address: '62 San Isidro Way, Purok 4, Barangay San Isidro',
    contact_number: '+63 927 555 0111',
    medical_notes: 'None',
    is_active: 1,
    created_at: '2026-08-28T11:00:00Z',
    updated_at: '2026-08-28T11:00:00Z'
  },
  {
    id: 12,
    user_id: 'RES-1012',
    device_id: 'HND-012',
    full_name: 'Morgan Santos',
    address: '42 Mabini St, Purok 2, Barangay San Isidro',
    contact_number: '+63 917 555 0142',
    medical_notes: 'Asthma, Penicillin allergy',
    is_active: 1,
    created_at: '2026-09-01T08:00:00Z',
    updated_at: '2026-10-01T10:00:00Z'
  }
];

export const INITIAL_INCIDENTS = [
  // 1. New - Medical (Morgan Santos, 2 hops, 2.4s delay, Live GPS)
  {
    id: 1,
    incident_code: 'INC-2026-084',
    packet_hash: 'hash-res1012-medical-143205',
    user_id: 'RES-1012',
    device_id: 'HND-042',
    is_registered_flag: 1,
    emergency_type: 'medical',
    latitude: 13.9412,
    longitude: 121.1624,
    area_name: 'Purok 2 Plaza',
    gps_status: 'valid',
    report_time: '2026-10-16T14:32:05+08:00',
    receipt_time: '2026-10-16T14:32:07.4+08:00',
    receipt_delay: 2.4,
    hop_count: 2,
    hop_path: 'HND-042 → REL-02 → STN-01',
    rssi: -68,
    snr: 7.5,
    status: 'New',
    assigned_responder: 'Team Alpha — Tanod Unit 2 (Devon Cruz)',
    notes: 'Emergency SOS packet decoded via 2-hop mesh path. Resident experiencing acute asthma attack.',
    is_unread: 1,
    resident_name: 'Morgan Santos',
    resident_address: '42 Mabini St, Purok 2, Barangay San Isidro',
    resident_contact: '+63 917 555 0142',
    resident_medical_notes: 'Asthma, Penicillin allergy'
  },
  // 2. New - Fire (Taylor Cruz, 3 hops, Live GPS)
  {
    id: 2,
    incident_code: 'INC-2026-085',
    packet_hash: 'hash-res1009-fire-142940',
    user_id: 'RES-1009',
    device_id: 'HND-009',
    is_registered_flag: 1,
    emergency_type: 'fire',
    latitude: 13.9435,
    longitude: 121.1650,
    area_name: 'Purok 3 Market',
    gps_status: 'valid',
    report_time: '2026-10-16T14:29:40+08:00',
    receipt_time: '2026-10-16T14:29:43.8+08:00',
    receipt_delay: 3.8,
    hop_count: 3,
    hop_path: 'HND-009 → REL-01 → REL-03 → STN-01',
    rssi: -79,
    snr: 5.2,
    status: 'New',
    assigned_responder: null,
    notes: 'Electrical smoke spotted behind commercial market stalls.',
    is_unread: 1,
    resident_name: 'Taylor Cruz',
    resident_address: '15 Rizal Ave, Purok 3, Barangay San Isidro',
    resident_contact: '+63 925 555 0109',
    resident_medical_notes: 'Hypertension'
  },
  // 3. Acknowledged - Flagged Report (Deactivated RES-1004, Stale GPS)
  {
    id: 3,
    incident_code: 'INC-2026-083',
    packet_hash: 'hash-res1004-medical-141520',
    user_id: 'RES-1004',
    device_id: 'HND-004',
    is_registered_flag: 0, // DEACTIVATED RESIDENT
    emergency_type: 'medical',
    latitude: 13.9390,
    longitude: 121.1590,
    area_name: 'Purok 5 Riverside',
    gps_status: 'stale',
    report_time: '2026-10-16T14:15:20+08:00',
    receipt_time: '2026-10-16T14:15:24.1+08:00',
    receipt_delay: 4.1,
    hop_count: 2,
    hop_path: 'HND-004 → REL-04 → STN-01',
    rssi: -82,
    snr: 4.6,
    status: 'Acknowledged',
    assigned_responder: 'Tanod Patrol Unit 4',
    notes: 'Flagged report from deactivated resident RES-1004 received and acknowledged by duty officer.',
    is_unread: 0,
    resident_name: 'Alex Rivera',
    resident_address: '27 Riverside Dr, Purok 5, Barangay San Isidro',
    resident_contact: '+63 920 555 0104',
    resident_medical_notes: 'Cardiac condition, Aspirin regimen'
  },
  // 4. Acknowledged - Flagged Report (Unregistered UNK-09, HND-999)
  {
    id: 4,
    incident_code: 'INC-2026-086',
    packet_hash: 'hash-unk09-fire-141018',
    user_id: 'UNK-09',
    device_id: 'HND-999',
    is_registered_flag: 0, // UNREGISTERED DEVICE
    emergency_type: 'fire',
    latitude: 13.9450,
    longitude: 121.1610,
    area_name: 'Purok 4 Market',
    gps_status: 'valid',
    report_time: '2026-10-16T14:10:18+08:00',
    receipt_time: '2026-10-16T14:10:20.9+08:00',
    receipt_delay: 2.9,
    hop_count: 1,
    hop_path: 'HND-999 → STN-01',
    rssi: -64,
    snr: 9.1,
    status: 'Acknowledged',
    assigned_responder: 'Barangay Fire Volunteer Crew 2',
    notes: 'Grass fire reported near school perimeter from unlinked device HND-999.',
    is_unread: 0,
    resident_name: 'Unknown Citizen',
    resident_address: 'Purok 4 School Boundary Sector',
    resident_contact: 'N/A',
    resident_medical_notes: 'None'
  },
  // 5. Responding - Crime (Casey Navarro, 1 hop, Live GPS)
  {
    id: 5,
    incident_code: 'INC-2026-082',
    packet_hash: 'hash-res1010-crime-134500',
    user_id: 'RES-1010',
    device_id: 'HND-010',
    is_registered_flag: 1,
    emergency_type: 'crime',
    latitude: 13.9420,
    longitude: 121.1605,
    area_name: 'Purok 1 North',
    gps_status: 'valid',
    report_time: '2026-10-16T13:45:00+08:00',
    receipt_time: '2026-10-16T13:45:02.1+08:00',
    receipt_delay: 2.1,
    hop_count: 1,
    hop_path: 'HND-010 → STN-01',
    rssi: -71,
    snr: 8.0,
    status: 'Responding',
    assigned_responder: 'Tanod Unit 1 — Devon Cruz',
    notes: 'Burglary attempt in progress at commercial stall. Responders on site.',
    is_unread: 0,
    resident_name: 'Casey Navarro',
    resident_address: '8 Bonifacio St, Purok 1, Barangay San Isidro',
    resident_contact: '+63 926 555 0110',
    resident_medical_notes: 'Diabetic (Type 2)'
  },
  // 6. Responding - Traffic Accident (Sam Taylor, 2 hops, Live GPS)
  {
    id: 6,
    incident_code: 'INC-2026-081',
    packet_hash: 'hash-res1011-traffic-132000',
    user_id: 'RES-1011',
    device_id: 'HND-011',
    is_registered_flag: 1,
    emergency_type: 'traffic_accident',
    latitude: 13.9465,
    longitude: 121.1670,
    area_name: 'Purok 6 Highway Crossing',
    gps_status: 'valid',
    report_time: '2026-10-16T13:20:00+08:00',
    receipt_time: '2026-10-16T13:20:03.5+08:00',
    receipt_delay: 3.5,
    hop_count: 2,
    hop_path: 'HND-011 → REL-03 → STN-01',
    rssi: -75,
    snr: 6.8,
    status: 'Responding',
    assigned_responder: 'Barangay Rescue 1 & Patrol Tricycle',
    notes: 'Motorcycle collision at highway intersection. First aid kit and stretchers deployed.',
    is_unread: 0,
    resident_name: 'Sam Taylor',
    resident_address: '62 San Isidro Way, Purok 4, Barangay San Isidro',
    resident_contact: '+63 927 555 0111',
    resident_medical_notes: 'None'
  },
  // 7. Resolved - Disaster (Fernando Lim, 3 hops, Live GPS)
  {
    id: 7,
    incident_code: 'INC-2026-080',
    packet_hash: 'hash-res1005-disaster-110000',
    user_id: 'RES-1005',
    device_id: 'HND-005',
    is_registered_flag: 1,
    emergency_type: 'disaster',
    latitude: 13.9370,
    longitude: 121.1630,
    area_name: 'Purok 5 River Canal',
    gps_status: 'valid',
    report_time: '2026-10-16T11:00:00+08:00',
    receipt_time: '2026-10-16T11:00:04.2+08:00',
    receipt_delay: 4.2,
    hop_count: 3,
    hop_path: 'HND-005 → REL-04 → REL-01 → STN-01',
    rssi: -85,
    snr: 3.9,
    status: 'Resolved',
    assigned_responder: 'Tanod Unit 3 & BFP',
    notes: 'Flash flood overflow contained with sandbags. Resident assisted safely.',
    is_unread: 0,
    resident_name: 'Fernando Lim',
    resident_address: '88 San Isidro Way, Purok 4, Barangay San Isidro',
    resident_contact: '+63 921 555 0105',
    resident_medical_notes: 'Mobility impairment (uses wheelchair)'
  },
  // 8. False Alarm - Crime (Elena Morales, No GPS Fix)
  {
    id: 8,
    incident_code: 'INC-2026-079',
    packet_hash: 'hash-res1007-crime-091500',
    user_id: 'RES-1007',
    device_id: 'HND-007',
    is_registered_flag: 1,
    emergency_type: 'crime',
    latitude: 13.9440,
    longitude: 121.1580,
    area_name: 'Purok 1 School Alley',
    gps_status: 'unavailable', // [No GPS Fix]
    report_time: '2026-10-16T09:15:00+08:00',
    receipt_time: '2026-10-16T09:15:03.1+08:00',
    receipt_delay: 3.1,
    hop_count: 2,
    hop_path: 'HND-007 → REL-01 → STN-01',
    rssi: -76,
    snr: 7.0,
    status: 'False alarm',
    assigned_responder: 'Tanod Unit 1',
    notes: 'Accidental SOS button press while device in backpack. Area verified clear.',
    is_unread: 0,
    resident_name: 'Elena Morales',
    resident_address: '33 Mabini St, Purok 2, Barangay San Isidro',
    resident_contact: '+63 923 555 0107',
    resident_medical_notes: 'None reported'
  },
  // Historical Records (Total 20 records for rich Incident History)
  {
    id: 9,
    incident_code: 'INC-2026-078',
    packet_hash: 'hash-hist-078',
    user_id: 'RES-1001',
    device_id: 'HND-001',
    is_registered_flag: 1,
    emergency_type: 'medical',
    latitude: 13.9415,
    longitude: 121.1620,
    area_name: 'Purok 2 Poblacion',
    gps_status: 'valid',
    report_time: '2026-10-15T18:22:10+08:00',
    receipt_time: '2026-10-15T18:22:12.5+08:00',
    receipt_delay: 2.5,
    hop_count: 1,
    hop_path: 'HND-001 → STN-01',
    rssi: -65,
    snr: 8.9,
    status: 'Resolved',
    assigned_responder: 'Barangay Health Center Nurse Unit',
    notes: 'Elevated blood pressure crisis handled with oral medication.',
    is_unread: 0,
    resident_name: 'Maria Santos',
    resident_address: '12 Mabini St, Purok 2, Barangay San Isidro',
    resident_contact: '+63 917 555 0101',
    resident_medical_notes: 'Hypertension'
  },
  {
    id: 10,
    incident_code: 'INC-2026-077',
    packet_hash: 'hash-hist-077',
    user_id: 'RES-1002',
    device_id: 'HND-002',
    is_registered_flag: 1,
    emergency_type: 'fire',
    latitude: 13.9430,
    longitude: 121.1648,
    area_name: 'Purok 3 Market Stalls',
    gps_status: 'valid',
    report_time: '2026-10-15T15:40:00+08:00',
    receipt_time: '2026-10-15T15:40:03.2+08:00',
    receipt_delay: 3.2,
    hop_count: 2,
    hop_path: 'HND-002 → REL-01 → STN-01',
    rssi: -73,
    snr: 7.1,
    status: 'Resolved',
    assigned_responder: 'BFP Lipa Sub-station & Tanod Unit 2',
    notes: 'Kitchen stove flare-up suppressed with dry chemical extinguisher.',
    is_unread: 0,
    resident_name: 'Juan Dela Cruz',
    resident_address: '24 Rizal Ave, Purok 3, Barangay San Isidro',
    resident_contact: '+63 918 555 0102',
    resident_medical_notes: 'Diabetic (Type 2)'
  },
  {
    id: 11,
    incident_code: 'INC-2026-076',
    packet_hash: 'hash-hist-076',
    user_id: 'RES-1003',
    device_id: 'HND-003',
    is_registered_flag: 1,
    emergency_type: 'crime',
    latitude: 13.9422,
    longitude: 121.1600,
    area_name: 'Purok 1 Hallway',
    gps_status: 'valid',
    report_time: '2026-10-15T02:10:00+08:00',
    receipt_time: '2026-10-15T02:10:02.0+08:00',
    receipt_delay: 2.0,
    hop_count: 1,
    hop_path: 'HND-003 → STN-01',
    rssi: -66,
    snr: 9.3,
    status: 'Resolved',
    assigned_responder: 'Night Tanod Roving Patrol',
    notes: 'Suspicious prowler reported; perimeter search completed without incident.',
    is_unread: 0,
    resident_name: 'Rosa Garcia',
    resident_address: '5 Bonifacio St, Purok 1, Barangay San Isidro',
    resident_contact: '+63 919 555 0103',
    resident_medical_notes: 'None reported'
  },
  {
    id: 12,
    incident_code: 'INC-2026-075',
    packet_hash: 'hash-hist-075',
    user_id: 'RES-1006',
    device_id: 'HND-006',
    is_registered_flag: 1,
    emergency_type: 'medical',
    latitude: 13.9418,
    longitude: 121.1612,
    area_name: 'Purok 1 North Sector',
    gps_status: 'valid',
    report_time: '2026-10-14T19:50:00+08:00',
    receipt_time: '2026-10-14T19:50:02.8+08:00',
    receipt_delay: 2.8,
    hop_count: 2,
    hop_path: 'HND-006 → REL-02 → STN-01',
    rssi: -70,
    snr: 8.2,
    status: 'Resolved',
    assigned_responder: 'Tanod Unit 1 & Ambulance',
    notes: 'Allergic reaction to wasp sting; resident treated promptly with EpiPen.',
    is_unread: 0,
    resident_name: 'Teresa Aquino',
    resident_address: '19 Bonifacio St, Purok 1, Barangay San Isidro',
    resident_contact: '+63 922 555 0106',
    resident_medical_notes: 'Severe bee sting allergy (EpiPen carrier)'
  },
  {
    id: 13,
    incident_code: 'INC-2026-074',
    packet_hash: 'hash-hist-074',
    user_id: 'RES-1007',
    device_id: 'HND-007',
    is_registered_flag: 1,
    emergency_type: 'traffic_accident',
    latitude: 13.9455,
    longitude: 121.1662,
    area_name: 'Purok 6 Highway Curve',
    gps_status: 'valid',
    report_time: '2026-10-14T12:05:00+08:00',
    receipt_time: '2026-10-14T12:05:03.9+08:00',
    receipt_delay: 3.9,
    hop_count: 2,
    hop_path: 'HND-007 → REL-03 → STN-01',
    rssi: -77,
    snr: 6.4,
    status: 'Resolved',
    assigned_responder: 'Barangay Rescue 1',
    notes: 'Skidded delivery van pulled from ditch; driver uninjured.',
    is_unread: 0,
    resident_name: 'Elena Morales',
    resident_address: '33 Mabini St, Purok 2, Barangay San Isidro',
    resident_contact: '+63 923 555 0107',
    resident_medical_notes: 'None reported'
  },
  {
    id: 14,
    incident_code: 'INC-2026-073',
    packet_hash: 'hash-hist-073',
    user_id: 'RES-1011',
    device_id: 'HND-011',
    is_registered_flag: 1,
    emergency_type: 'disaster',
    latitude: 13.9380,
    longitude: 121.1620,
    area_name: 'Purok 5 Riverside',
    gps_status: 'valid',
    report_time: '2026-10-13T16:30:00+08:00',
    receipt_time: '2026-10-13T16:30:04.5+08:00',
    receipt_delay: 4.5,
    hop_count: 3,
    hop_path: 'HND-011 → REL-04 → REL-01 → STN-01',
    rssi: -84,
    snr: 4.1,
    status: 'Resolved',
    assigned_responder: 'Tanod Rescue Unit 3',
    notes: 'Fallen acacia branch blocking river road cleared with chainsaw team.',
    is_unread: 0,
    resident_name: 'Sam Taylor',
    resident_address: '62 San Isidro Way, Purok 4, Barangay San Isidro',
    resident_contact: '+63 927 555 0111',
    resident_medical_notes: 'None'
  },
  {
    id: 15,
    incident_code: 'INC-2026-072',
    packet_hash: 'hash-hist-072',
    user_id: 'RES-1010',
    device_id: 'HND-010',
    is_registered_flag: 1,
    emergency_type: 'medical',
    latitude: 13.9425,
    longitude: 121.1610,
    area_name: 'Purok 1 Hallway',
    gps_status: 'valid',
    report_time: '2026-10-13T09:10:00+08:00',
    receipt_time: '2026-10-13T09:10:02.1+08:00',
    receipt_delay: 2.1,
    hop_count: 1,
    hop_path: 'HND-010 → STN-01',
    rssi: -67,
    snr: 8.5,
    status: 'Resolved',
    assigned_responder: 'Health Worker Unit 2',
    notes: 'Diabetic resident hypoglycemic episode treated with glucose gel.',
    is_unread: 0,
    resident_name: 'Casey Navarro',
    resident_address: '8 Bonifacio St, Purok 1, Barangay San Isidro',
    resident_contact: '+63 926 555 0110',
    resident_medical_notes: 'Diabetic (Type 2)'
  },
  {
    id: 16,
    incident_code: 'INC-2026-071',
    packet_hash: 'hash-hist-071',
    user_id: 'RES-1002',
    device_id: 'HND-002',
    is_registered_flag: 1,
    emergency_type: 'crime',
    latitude: 13.9432,
    longitude: 121.1645,
    area_name: 'Purok 3 Market Plaza',
    gps_status: 'valid',
    report_time: '2026-10-12T21:45:00+08:00',
    receipt_time: '2026-10-12T21:45:03.0+08:00',
    receipt_delay: 3.0,
    hop_count: 2,
    hop_path: 'HND-002 → REL-01 → STN-01',
    rssi: -72,
    snr: 7.4,
    status: 'Resolved',
    assigned_responder: 'Tanod Night Unit 1',
    notes: 'Dispute between night vendors resolved peacefully by duty tanod.',
    is_unread: 0,
    resident_name: 'Juan Dela Cruz',
    resident_address: '24 Rizal Ave, Purok 3, Barangay San Isidro',
    resident_contact: '+63 918 555 0102',
    resident_medical_notes: 'Diabetic (Type 2)'
  },
  {
    id: 17,
    incident_code: 'INC-2026-070',
    packet_hash: 'hash-hist-070',
    user_id: 'RES-1005',
    device_id: 'HND-005',
    is_registered_flag: 1,
    emergency_type: 'fire',
    latitude: 13.9442,
    longitude: 121.1630,
    area_name: 'Purok 4 School Sector',
    gps_status: 'valid',
    report_time: '2026-10-12T14:15:00+08:00',
    receipt_time: '2026-10-12T14:15:03.5+08:00',
    receipt_delay: 3.5,
    hop_count: 2,
    hop_path: 'HND-005 → REL-02 → STN-01',
    rssi: -74,
    snr: 6.9,
    status: 'Resolved',
    assigned_responder: 'BFP Lipa Volunteers',
    notes: 'Rubbish fire extinguished behind school gymnasium.',
    is_unread: 0,
    resident_name: 'Fernando Lim',
    resident_address: '88 San Isidro Way, Purok 4, Barangay San Isidro',
    resident_contact: '+63 921 555 0105',
    resident_medical_notes: 'Mobility impairment (uses wheelchair)'
  },
  {
    id: 18,
    incident_code: 'INC-2026-069',
    packet_hash: 'hash-hist-069',
    user_id: 'RES-1001',
    device_id: 'HND-001',
    is_registered_flag: 1,
    emergency_type: 'traffic_accident',
    latitude: 13.9410,
    longitude: 121.1618,
    area_name: 'Purok 2 Poblacion St',
    gps_status: 'valid',
    report_time: '2026-10-11T17:30:00+08:00',
    receipt_time: '2026-10-11T17:30:02.2+08:00',
    receipt_delay: 2.2,
    hop_count: 1,
    hop_path: 'HND-001 → STN-01',
    rssi: -66,
    snr: 8.7,
    status: 'Resolved',
    assigned_responder: 'Barangay Rescue 1',
    notes: 'Minor bicycle spill on gravel shoulder; antiseptic applied.',
    is_unread: 0,
    resident_name: 'Maria Santos',
    resident_address: '12 Mabini St, Purok 2, Barangay San Isidro',
    resident_contact: '+63 917 555 0101',
    resident_medical_notes: 'Hypertension'
  },
  {
    id: 19,
    incident_code: 'INC-2026-068',
    packet_hash: 'hash-hist-068',
    user_id: 'RES-1003',
    device_id: 'HND-003',
    is_registered_flag: 1,
    emergency_type: 'disaster',
    latitude: 13.9388,
    longitude: 121.1595,
    area_name: 'Purok 5 Riverside',
    gps_status: 'valid',
    report_time: '2026-10-10T10:00:00+08:00',
    receipt_time: '2026-10-10T10:00:04.0+08:00',
    receipt_delay: 4.0,
    hop_count: 3,
    hop_path: 'HND-003 → REL-04 → REL-01 → STN-01',
    rssi: -83,
    snr: 4.5,
    status: 'Resolved',
    assigned_responder: 'Barangay Disaster Risk Reduction Team',
    notes: 'Heavy rainfall drainage canal inspected and cleared of silt.',
    is_unread: 0,
    resident_name: 'Rosa Garcia',
    resident_address: '5 Bonifacio St, Purok 1, Barangay San Isidro',
    resident_contact: '+63 919 555 0103',
    resident_medical_notes: 'None reported'
  },
  {
    id: 20,
    incident_code: 'INC-2026-067',
    packet_hash: 'hash-hist-067',
    user_id: 'RES-1006',
    device_id: 'HND-006',
    is_registered_flag: 1,
    emergency_type: 'medical',
    latitude: 13.9420,
    longitude: 121.1608,
    area_name: 'Purok 1 North Sector',
    gps_status: 'valid',
    report_time: '2026-10-09T08:15:00+08:00',
    receipt_time: '2026-10-09T08:15:02.4+08:00',
    receipt_delay: 2.4,
    hop_count: 1,
    hop_path: 'HND-006 → STN-01',
    rssi: -68,
    snr: 8.4,
    status: 'Resolved',
    assigned_responder: 'Barangay Health Unit',
    notes: 'Elderly resident check-up and vital signs assessment.',
    is_unread: 0,
    resident_name: 'Teresa Aquino',
    resident_address: '19 Bonifacio St, Purok 1, Barangay San Isidro',
    resident_contact: '+63 922 555 0106',
    resident_medical_notes: 'Severe bee sting allergy (EpiPen carrier)'
  }
];

export const INITIAL_LOGS = [
  // 3 audit log entries for Incident 1 (INC-2026-084)
  {
    id: 1,
    incident_id: 1,
    previous_status: null,
    new_status: 'New',
    changed_by_name: 'METHORE LoRa Gateway',
    changed_by_role: 'system',
    note: 'Emergency SOS packet decoded via 2-hop mesh path (HND-042 → REL-02 → STN-01). Audio alarm triggered.',
    timestamp: '2026-10-16T14:32:07.4+08:00'
  },
  {
    id: 2,
    incident_id: 1,
    previous_status: 'New',
    new_status: 'Acknowledged',
    changed_by_name: 'Alex Rivera',
    changed_by_role: 'official',
    note: 'Station acknowledged emergency transmission. Radio alert tone verified.',
    timestamp: '2026-10-16T14:32:30+08:00'
  },
  {
    id: 3,
    incident_id: 1,
    previous_status: 'Acknowledged',
    new_status: 'Responding',
    changed_by_name: 'Alex Rivera',
    changed_by_role: 'official',
    note: 'Team Alpha — Tanod Unit 2 (Devon Cruz) dispatched with first responder medical bag.',
    timestamp: '2026-10-16T14:34:10+08:00'
  },
  // Incident 2
  {
    id: 4,
    incident_id: 2,
    previous_status: null,
    new_status: 'New',
    changed_by_name: 'METHORE LoRa Gateway',
    changed_by_role: 'system',
    note: 'Fire alert packet received via 3 hops.',
    timestamp: '2026-10-16T14:29:43.8+08:00'
  },
  // Incident 3 (Flagged)
  {
    id: 5,
    incident_id: 3,
    previous_status: null,
    new_status: 'New',
    changed_by_name: 'METHORE LoRa Gateway',
    changed_by_role: 'system',
    note: 'SOS packet received from deactivated resident RES-1004. Flagged for review.',
    timestamp: '2026-10-16T14:15:24.1+08:00'
  },
  {
    id: 6,
    incident_id: 3,
    previous_status: 'New',
    new_status: 'Acknowledged',
    changed_by_name: 'Alex Rivera',
    changed_by_role: 'official',
    note: 'Report from deactivated resident RES-1004 received and acknowledged by duty officer.',
    timestamp: '2026-10-16T14:16:00+08:00'
  },
  // Incident 4 (Flagged)
  {
    id: 7,
    incident_id: 4,
    previous_status: null,
    new_status: 'New',
    changed_by_name: 'METHORE LoRa Gateway',
    changed_by_role: 'system',
    note: 'Report from unknown hardware safely logged with is_registered_flag=0.',
    timestamp: '2026-10-16T14:10:20.9+08:00'
  },
  {
    id: 8,
    incident_id: 4,
    previous_status: 'New',
    new_status: 'Acknowledged',
    changed_by_name: 'Alex Rivera',
    changed_by_role: 'official',
    note: 'Flagged unlinked device packet acknowledged; fire volunteer crew deployed.',
    timestamp: '2026-10-16T14:11:15+08:00'
  }
];

export const INITIAL_NODES = [
  {
    id: 1,
    node_id: 'STN-01',
    name: 'Barangay Hall Receiving Station',
    role: 'station',
    lat: 13.9412,
    lon: 121.1624,
    battery_level: 100,
    power_source: 'Mains + Battery Backup',
    rssi: -45,
    snr: 12.0,
    status: 'online',
    last_heard: '2026-10-16T14:32:08Z'
  },
  {
    id: 2,
    node_id: 'REL-01',
    name: 'Purok 2 Plaza Relay',
    role: 'relay',
    lat: 13.9425,
    lon: 121.1600,
    battery_level: 94,
    power_source: 'Solar + LiFePO4',
    rssi: -68,
    snr: 8.8,
    status: 'online',
    last_heard: '2026-10-16T14:30:15Z'
  },
  {
    id: 3,
    node_id: 'REL-02',
    name: 'Purok 4 School Tower Relay',
    role: 'relay',
    lat: 13.9448,
    lon: 121.1645,
    battery_level: 88,
    power_source: 'Solar + LiFePO4',
    rssi: -72,
    snr: 7.9,
    status: 'online',
    last_heard: '2026-10-16T14:28:40Z'
  },
  {
    id: 4,
    node_id: 'REL-03',
    name: 'Boundary Hilltop Relay',
    role: 'relay',
    lat: 13.9470,
    lon: 121.1668,
    battery_level: 76,
    power_source: 'Solar + LiFePO4',
    rssi: -81,
    snr: 6.2,
    status: 'online',
    last_heard: '2026-10-16T14:25:00Z'
  },
  {
    id: 5,
    node_id: 'REL-04',
    name: 'Riverside Outpost Relay',
    role: 'relay',
    lat: 13.9385,
    lon: 121.1585,
    battery_level: 19,
    power_source: 'Solar + LiPo',
    rssi: -89,
    snr: 3.4,
    status: 'low_battery',
    last_heard: '2026-10-16T14:15:20Z'
  },
  {
    id: 6,
    node_id: 'REL-05',
    name: 'North Ridge Solar Relay',
    role: 'relay',
    lat: 13.9490,
    lon: 121.1550,
    battery_level: 0,
    power_source: 'Solar + LiPo',
    rssi: -105,
    snr: -2.0,
    status: 'offline',
    last_heard: '2026-10-15T18:00:00Z'
  }
];

export const INITIAL_SETTINGS = {
  id: 1,
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
};

export const INITIAL_SESSIONS = [
  {
    id: 1,
    session_name: 'Scenario A: 1–2 Hop Clear Line-of-Sight',
    is_active: 0,
    started_at: '2026-10-16T10:00:00+08:00',
    ended_at: '2026-10-16T11:30:00+08:00',
    created_by: 'Sam Taylor'
  },
  {
    id: 2,
    session_name: 'Scenario B: 3-Hop Heavy Foliage & Rain',
    is_active: 1,
    started_at: '2026-10-16T13:00:00+08:00',
    ended_at: null,
    created_by: 'Sam Taylor'
  }
];

// Pre-load 50 test packets for Scenario B:
// Exactly 48 Delivered, 2 Lost = 96.0% MDR
// 1 Hop: 18 sent, 18 delivered = 100%
// 2 Hops: 22 sent, 21 delivered, 1 lost (#28) = 95.5%
// 3 Hops: 10 sent, 9 delivered, 1 lost (#44) = 90.0%
// Delays: Min 1.2s, Max 11.4s, Average 3.8s
export const INITIAL_TEST_LOGS = (() => {
  const logs = [];
  // Target delays for 48 delivered packets that average exactly 3.80s:
  // Total sum of 48 delays = 48 * 3.8 = 182.4s.
  // We distribute realistic delays with min = 1.2 and max = 11.4:
  const baseDelays = [
    // 1-Hop (18 packets: 1.2s to 2.8s, sum ~ 36.0s)
    1.2, 1.4, 1.5, 1.6, 1.8, 1.9, 2.0, 2.1, 2.2, 2.3, 2.4, 2.5, 2.5, 2.6, 2.7, 2.7, 2.8, 2.8,
    // 2-Hop (21 delivered packets: 2.8s to 5.2s, sum ~ 79.8s)
    2.8, 2.9, 3.1, 3.2, 3.4, 3.5, 3.6, 3.7, 3.8, 3.8, 3.9, 4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.8, 5.0, 5.2,
    // 3-Hop (9 delivered packets: 5.5s to 11.4s, sum = 182.4 - 36.9 - 80.9 = 64.6s)
    5.5, 5.8, 6.2, 6.7, 7.1, 7.8, 8.4, 9.7, 11.4
  ];

  let deliveredIdx = 0;
  for (let i = 1; i <= 50; i++) {
    let hop = 1;
    if (i > 18 && i <= 40) hop = 2;
    if (i > 40) hop = 3;

    // Packets #28 (2-hop) and #44 (3-hop) are Lost (total 2 lost, 48 delivered)
    const isLost = i === 28 || i === 44;
    const delay = !isLost ? baseDelays[deliveredIdx++] : null;

    const minute = String(Math.floor((i - 1) / 2)).padStart(2, '0');
    const sec = (i % 2 === 0) ? '30' : '00';
    const sendTime = `2026-10-16T13:${minute}:${sec}+08:00`;
    
    let receiveTime = null;
    if (!isLost && delay) {
      const recSeconds = Math.floor(delay);
      const recFraction = Math.floor((delay - recSeconds) * 10);
      const padSec = String(parseInt(sec, 10) + recSeconds).padStart(2, '0');
      receiveTime = `2026-10-16T13:${minute}:${padSec}.${recFraction}+08:00`;
    }

    logs.push({
      id: i,
      session_id: 2,
      packet_id: `PKT-TEST-${String(i).padStart(3, '0')}`,
      send_time: sendTime,
      receive_time: receiveTime,
      delay_seconds: delay,
      hop_count: hop,
      rssi: !isLost ? -66 - (hop * 8) + (i % 4) : null,
      snr: !isLost ? Number((9.5 - hop * 1.5 + (i % 3) * 0.4).toFixed(1)) : null,
      outcome: isLost ? 'Lost' : 'Delivered'
    });
  }
  return logs;
})();

// =========================================================================
// LOCALSTORAGE HELPERS
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
 * Restores initial rich demo dataset in localStorage
 */
export function resetDemoData() {
  setStorage('residents', INITIAL_RESIDENTS);
  setStorage('incidents', INITIAL_INCIDENTS);
  setStorage('logs', INITIAL_LOGS);
  setStorage('nodes', INITIAL_NODES);
  setStorage('settings', INITIAL_SETTINGS);
  setStorage('sessions', INITIAL_SESSIONS);
  setStorage('test_logs', INITIAL_TEST_LOGS);
  try {
    localStorage.setItem(SEED_VERSION_KEY, CURRENT_SEED_VERSION);
  } catch {}

  // Dispatch custom event for UI components to immediately re-render
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('methore_data_reset'));
  }
  return true;
}

// Auto-seed or bump version if stale/empty
if (typeof window !== 'undefined') {
  const currentVersion = localStorage.getItem(SEED_VERSION_KEY);
  if (currentVersion !== CURRENT_SEED_VERSION || !localStorage.getItem('methore_residents')) {
    resetDemoData();
  }
}

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
        const u = (username || '').toLowerCase().trim();
        const demoAccounts = {
          'alex.rivera': { id: 1, username: 'alex.rivera', full_name: 'Alex Rivera', role: 'official' },
          'jordan.reyes': { id: 2, username: 'jordan.reyes', full_name: 'Jordan Reyes', role: 'administrator' },
          'sam.taylor': { id: 3, username: 'sam.taylor', full_name: 'Sam Taylor', role: 'researcher' }
        };
        const user = demoAccounts[u] || { id: 99, username: u, full_name: username || 'Operator', role: 'official' };
        return {
          status: 'success',
          token: `mock-token-${u}-${Date.now()}`,
          user
        };
      }

      try {
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
      } catch (err) {
        console.warn('Live API unavailable, falling back to mock login:', err.message);
        return api.auth.login(username, password);
      }
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
            (i.resident_name || '').toLowerCase().includes(s) ||
            (i.notes || '').toLowerCase().includes(s)
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
          list = list.filter(i => (i.report_time || i.receipt_time) >= date_from);
        }
        if (date_to) {
          list = list.filter(i => (i.report_time || i.receipt_time) <= date_to + 'T23:59:59');
        }

        // Compare as instants: seed times are +08:00 and runtime ones are UTC, so string order is wrong.
        const instant = (i) => new Date(i.receipt_time || i.report_time).getTime();
        if (sort === 'oldest') {
          list.sort((a, b) => instant(a) - instant(b));
        } else if (sort === 'status') {
          list.sort((a, b) => a.status.localeCompare(b.status));
        } else {
          list.sort((a, b) => instant(b) - instant(a));
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

      try {
        const q = new URLSearchParams(params).toString();
        const res = await fetch(`${API_BASE}/incidents?${q}`);
        if (!res.ok) throw new Error('Failed to fetch incidents');
        return res.json();
      } catch (err) {
        console.warn('Backend unavailable, using mock incidents:', err.message);
        return api.incidents.getAll(params);
      }
    },

    async getById(id) {
      if (USE_MOCK) {
        const incidents = getStorage('incidents', INITIAL_INCIDENTS);
        const logs = getStorage('logs', INITIAL_LOGS);
        const residents = getStorage('residents', INITIAL_RESIDENTS);

        const inc = incidents.find(i => String(i.id) === String(id) || i.incident_code === id);
        if (!inc) throw new Error('Incident not found');

        const incLogs = logs
          .filter(l => l.incident_id === inc.id)
          .sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''));

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

      try {
        const res = await fetch(`${API_BASE}/incidents/${id}`);
        if (!res.ok) throw new Error('Incident not found');
        return res.json();
      } catch (err) {
        console.warn('Backend unavailable, using mock getById:', err.message);
        return api.incidents.getById(id);
      }
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

      try {
        const res = await fetch(`${API_BASE}/incidents/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, changed_by_name, changed_by_role, note })
        });
        if (!res.ok) throw new Error('Failed to update status');
        return res.json();
      } catch (err) {
        console.warn('Backend unavailable, updating status in mock:', err.message);
        return api.incidents.updateStatus(id, { status, changed_by_name, changed_by_role, note });
      }
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

      try {
        const res = await fetch(`${API_BASE}/incidents/${id}/notes`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assigned_responder, notes, changed_by_name, changed_by_role })
        });
        if (!res.ok) throw new Error('Failed to update notes');
        return res.json();
      } catch (err) {
        console.warn('Backend unavailable, updating notes in mock:', err.message);
        return api.incidents.updateNotes(id, { assigned_responder, notes, changed_by_name, changed_by_role });
      }
    },

    getExportCsvUrl(params = {}) {
      if (USE_MOCK) {
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
  // PACKETS
  // -----------------------------------------------------------------------
  packets: {
    async ingest(packet) {
      if (USE_MOCK) {
        const incidents = getStorage('incidents', INITIAL_INCIDENTS);
        const residents = getStorage('residents', INITIAL_RESIDENTS);
        const settings = getStorage('settings', INITIAL_SETTINGS);
        const logs = getStorage('logs', INITIAL_LOGS);

        const packetHash = computeSimpleHash(packet.user_id, packet.emergency_type, packet.report_time);

        // Duplicate suppression
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

        // Check registration
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
          latitude: Number(packet.latitude) || 13.9412,
          longitude: Number(packet.longitude) || 121.1624,
          area_name: packet.area_name || 'Barangay San Isidro Sector',
          gps_status: packet.gps_status || 'valid',
          report_time: packet.report_time || now,
          receipt_time: now,
          receipt_delay: 2.5,
          hop_count: parseInt(packet.hop_count, 10) || 1,
          hop_path: `${packet.device_id} → STN-01`,
          rssi: parseInt(packet.rssi, 10) || -72,
          snr: parseFloat(packet.snr) || 7.0,
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

      try {
        const res = await fetch(`${API_BASE}/packets/ingest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(packet)
        });
        if (!res.ok) throw new Error('Failed to ingest packet');
        return res.json();
      } catch (err) {
        console.warn('Backend unavailable, ingesting packet in mock:', err.message);
        return api.packets.ingest(packet);
      }
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
            (r.user_id || '').toLowerCase().includes(s) ||
            (r.device_id || '').toLowerCase().includes(s) ||
            (r.full_name || '').toLowerCase().includes(s) ||
            (r.address || '').toLowerCase().includes(s)
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

      try {
        const q = new URLSearchParams(params).toString();
        const res = await fetch(`${API_BASE}/residents?${q}`);
        if (!res.ok) throw new Error('Failed to fetch residents');
        return res.json();
      } catch (err) {
        console.warn('Backend unavailable, using mock residents:', err.message);
        return api.residents.getAll(params);
      }
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

      try {
        const res = await fetch(`${API_BASE}/residents/flagged-reports`);
        if (!res.ok) throw new Error('Failed to fetch flagged reports');
        return res.json();
      } catch (err) {
        console.warn('Backend unavailable, using mock flagged reports:', err.message);
        return api.residents.getFlaggedReports();
      }
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

      try {
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
      } catch (err) {
        console.warn('Backend unavailable, creating resident in mock:', err.message);
        return api.residents.create(data);
      }
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

      try {
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
      } catch (err) {
        console.warn('Backend unavailable, updating resident in mock:', err.message);
        return api.residents.update(id, data);
      }
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

      try {
        const res = await fetch(`${API_BASE}/residents/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_active: isActive })
        });
        if (!res.ok) throw new Error('Failed to toggle status');
        return res.json();
      } catch (err) {
        console.warn('Backend unavailable, toggling status in mock:', err.message);
        return api.residents.toggleStatus(id, isActive);
      }
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

      try {
        const res = await fetch(`${API_BASE}/network/status`);
        if (!res.ok) throw new Error('Failed to fetch network status');
        return res.json();
      } catch (err) {
        console.warn('Backend unavailable, using mock network status:', err.message);
        return api.network.getStatus();
      }
    },

    async updateSettings(newSettings) {
      if (USE_MOCK) {
        const current = getStorage('settings', INITIAL_SETTINGS);
        const updated = { ...current, ...newSettings };
        setStorage('settings', updated);
        return { status: 'success', settings: updated };
      }

      try {
        const res = await fetch(`${API_BASE}/network/settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSettings)
        });
        if (!res.ok) throw new Error('Failed to update network settings');
        return res.json();
      } catch (err) {
        console.warn('Backend unavailable, updating settings in mock:', err.message);
        return api.network.updateSettings(newSettings);
      }
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

      try {
        const res = await fetch(`${API_BASE}/network/nodes/${nodeId}/ping`, { method: 'POST' });
        if (!res.ok) throw new Error('Failed to ping node');
        return res.json();
      } catch (err) {
        console.warn('Backend unavailable, pinging node in mock:', err.message);
        return api.network.pingNode(nodeId);
      }
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

      try {
        const res = await fetch(`${API_BASE}/evaluation/sessions`);
        if (!res.ok) throw new Error('Failed to fetch sessions');
        return res.json();
      } catch (err) {
        console.warn('Backend unavailable, using mock sessions:', err.message);
        return api.evaluation.getSessions();
      }
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

      try {
        const res = await fetch(`${API_BASE}/evaluation/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_name, created_by })
        });
        if (!res.ok) throw new Error('Failed to create session');
        return res.json();
      } catch (err) {
        console.warn('Backend unavailable, creating session in mock:', err.message);
        return api.evaluation.createSession({ session_name, created_by });
      }
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

      try {
        const res = await fetch(`${API_BASE}/evaluation/sessions/${id}/stop`, { method: 'PATCH' });
        if (!res.ok) throw new Error('Failed to stop session');
        return res.json();
      } catch (err) {
        console.warn('Backend unavailable, stopping session in mock:', err.message);
        return api.evaluation.stopSession(id);
      }
    },

    async recordPacket(packet) {
      if (USE_MOCK) {
        const testLogs = getStorage('test_logs', INITIAL_TEST_LOGS);
        const newLog = {
          id: Date.now(),
          session_id: packet.session_id,
          packet_id: packet.packet_id || `PKT-TEST-${String(testLogs.length + 1).padStart(3, '0')}`,
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

      try {
        const res = await fetch(`${API_BASE}/evaluation/packets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(packet)
        });
        if (!res.ok) throw new Error('Failed to record test packet');
        return res.json();
      } catch (err) {
        console.warn('Backend unavailable, recording packet in mock:', err.message);
        return api.evaluation.recordPacket(packet);
      }
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
        for (let h = 1; h <= 3; h++) {
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
          },
          packets: logs
        };
      }

      try {
        const res = await fetch(`${API_BASE}/evaluation/sessions/${sessionId}/metrics`);
        if (!res.ok) throw new Error('Failed to fetch metrics');
        return res.json();
      } catch (err) {
        console.warn('Backend unavailable, using mock metrics:', err.message);
        return api.evaluation.getMetrics(sessionId);
      }
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
