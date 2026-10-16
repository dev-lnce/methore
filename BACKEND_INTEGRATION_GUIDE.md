# METHORE Frontend-Only UI Handoff & Backend Integration Guide

Welcome to the **METHORE** (Offline LoRa Mesh Emergency Communication System) frontend handoff package. This standalone repository folder (`/methore-ui-handoff`) contains the production-grade, Apple/DEVit minimalist React + Vite + Tailwind CSS interface.

It is completely decoupled from the `/backend` folder and is configured by default to run in **Mock Mode** (`VITE_USE_MOCK=true`) backed 100% by browser `localStorage`. When your backend API endpoints are ready, switching to **Live API Mode** takes just a single variable change in `.env`.

---

## 1. Quick-Start Guide

### 1.1 Running the Frontend in Standalone Mock Mode
```bash
# Navigate to the handoff directory
cd methore-ui-handoff

# Install dependencies (React 18, Vite 5, Tailwind 3, Lucide Icons)
npm install

# Start the local development server (starts on http://localhost:3000)
npm run dev
```

The frontend immediately boots with pre-seeded demo data ("Alex Rivera", "Jordan Reyes", "Sam Taylor", "Morgan Santos", "Taylor Cruz", "Casey Navarro", "Barangay San Isidro") with full offline simulation.

### 1.2 Switching from Mock Mode to Live API Mode
Open `.env` in the root of `methore-ui-handoff`:

```properties
# =========================================================================
# DATA MODE CONFIGURATION
# =========================================================================
# Set to 'false' to route all service requests directly to the live backend REST API.
# Set to 'true' to keep standalone client-side localStorage simulation.
VITE_USE_MOCK=false

# Live Express + SQLite API base endpoint
VITE_API_BASE_URL=http://localhost:4000/api
```

When `VITE_USE_MOCK=false`, every function in `src/services/api.js` bypasses `localStorage` and executes direct asynchronous `fetch` calls to `http://localhost:4000/api` using standard JSON payloads, JWT authentication headers, and standard HTTP response shapes.

### 1.3 Persistent "Reset Demo Data" Utility
For testing scenarios in Mock Mode, a persistent utility button labeled **"Reset Demo Data"** is placed in:
1. **Sidebar Footer**: Accessible on all dashboard pages.
2. **Login Screen**: Directly below the sign-in form card.

Clicking this resets all records in `localStorage` back to their factory-seeded state and displays a confirmation toast.

---

## 2. Screen-to-API Mapping Table

The METHORE frontend consists of **9 primary views**. The table below details every service method called by each screen, its target HTTP endpoint, required headers, query parameters, request payload, expected response structure, and HTTP status codes.

| Screen Route | UI View Name | `src/services/api.js` Method | HTTP Method & Path | Query Params / Headers | Request Body JSON | Expected Response Shape | HTTP Status Codes |
|---|---|---|---|---|---|---|---|
| `/login` | Station Sign-In | `api.auth.login(username, password)` | `POST /api/auth/login` | None | `{"username":"alex.rivera","password":"..."}` | `{"status":"success","token":"jwt...","user":{"id":1,"username":"alex.rivera","full_name":"Alex Rivera","role":"official"}}` | `200` OK<br>`400` Bad Request<br>`401` Unauthorized |
| All Authenticated Views | Auth Verification | `api.auth.me()` | `GET /api/auth/me` | `Authorization: Bearer <token>` | None | `{"status":"success","user":{"id":1,"username":"...","full_name":"...","role":"official"}}` | `200` OK<br>`401` Expired/Invalid Token |
| `/incidents` | Live Incidents Board | `api.incidents.getAll(params)` | `GET /api/incidents` | `?status=all&priority=all&page=1&limit=50` | None | `{"status":"success","data":[{"id":1,"tracking_number":"INC-2026-084","sender_id":"RES-1042","device_id":"HND-042","resident_name":"Morgan Santos","emergency_type":"medical","status":"reported","hop_count":2,"rssi":-88,"snr":6.5,"created_at":"2026-10-16T07:15:00Z"}],"pagination":{"page":1,"limit":50,"total":1}}` | `200` OK |
| `/incidents` & `/incidents/:id` | Status Update & Dispatch | `api.incidents.updateStatus(id, status, notes)` | `PATCH /api/incidents/:id/status` | `Authorization: Bearer <token>` | `{"status":"dispatched","notes":"Barangay emergency response team 1 deployed."}` | `{"status":"success","data":{"id":1,"status":"dispatched",...},"log":{"id":10,"incident_id":1,"previous_status":"reported","new_status":"dispatched","changed_by_user_id":1,"timestamp":"2026-10-16T07:20:00Z","notes":"..."}}` | `200` OK<br>`400` Invalid status<br>`404` Incident not found |
| `/incidents/:id` | Dedicated Incident Detail View | `api.incidents.getById(id)` | `GET /api/incidents/:id` | None | None | `{"status":"success","data":{"id":1,"tracking_number":"INC-2026-084","sender_id":"RES-1042","device_id":"HND-042","resident_name":"Morgan Santos","resident_address":"42 Mabini St...","medical_notes":"Asthma","emergency_type":"medical","status":"reported","gps_lat":14.5842,"gps_lng":121.0583,"hop_count":2,"rssi":-88,"snr":6.5,"is_registered_flag":1,"created_at":"...","logs":[{"id":1,"previous_status":null,"new_status":"reported","timestamp":"...","user_name":"Mesh Ingestion"}]}}` | `200` OK<br>`404` Not found |
| `/map` | Offline Barangay GIS Map | `api.incidents.getAll()` & `api.mesh.getNodes()` | `GET /api/incidents`<br>`GET /api/mesh/nodes` | None | None | Incidents array with `gps_lat`, `gps_lng`, `emergency_type`, `status`.<br>Nodes array with `id`, `node_name`, `node_type`, `latitude`, `longitude`, `status`, `battery_level`. | `200` OK |
| `/history` | Incident History Archive | `api.incidents.getHistory(params)` | `GET /api/incidents/history` | `?date_from=2026-10-01&date_to=2026-10-16&status=all&search=` | None | `{"status":"success","data":[{"id":1,"tracking_number":"INC-2026-084",...}]}` | `200` OK |
| `/history` | Export Incident CSV Archive | `api.incidents.getExportCsvUrl(params)` | `GET /api/incidents/export/csv` | `?date_from=...&date_to=...&status=...` | None | Streaming `text/csv; charset=utf-8` file with headers: `Tracking Number, Resident ID, Device ID, Resident Name, Type, Status, Lat, Lng, Hops, RSSI, SNR, Reported Time, Resolved Time`. | `200` OK (Content-Disposition attachment) |
| `/admin/residents` | Residents & Device Registry | `api.residents.getAll(params)` | `GET /api/residents` | `?search=&is_active=1` | None | `{"status":"success","data":[{"id":1,"user_id":"RES-1042","device_id":"HND-042","full_name":"Morgan Santos","address":"42 Mabini St...","contact_number":"+63 917 555 0142","medical_notes":"Asthma","is_active":1,"created_at":"2026-08-10T08:00:00Z"}]}` | `200` OK |
| `/admin/residents` | Register Handheld / Resident | `api.residents.create(payload)` | `POST /api/residents` | `Authorization: Bearer <token>` | `{"user_id":"RES-1099","device_id":"HND-099","full_name":"Maria Santos","address":"12 Luna St","contact_number":"+63 917 000 0000","medical_notes":"None"}` | `{"status":"success","data":{"id":5,"user_id":"RES-1099",...}}` | `201` Created<br>`400` Missing field<br>`409` Duplicate user_id or device_id |
| `/admin/residents` | Update Resident Profile | `api.residents.update(id, payload)` | `PUT /api/residents/:id` | `Authorization: Bearer <token>` | `{"device_id":"HND-042","full_name":"Morgan Santos","address":"...","contact_number":"...","medical_notes":"...","is_active":1}` | `{"status":"success","data":{"id":1,...}}` | `200` OK<br>`404` Not found<br>`409` Device conflict |
| `/admin/residents` | Deactivate / Activate Device | `api.residents.toggleActive(id, isActive)` | `PATCH /api/residents/:id/toggle` | `Authorization: Bearer <token>` | `{"is_active":0}` | `{"status":"success","data":{"id":1,"is_active":0,...}}` | `200` OK<br>`404` Not found |
| `/admin/network` | Node Topology & Diagnostics | `api.mesh.getNodes()` | `GET /api/mesh/nodes` | None | None | `{"status":"success","data":[{"id":"node-01","node_name":"San Isidro Repeater North","node_type":"repeater","status":"online","battery_level":94,"last_seen":"2026-10-16T07:30:00Z","latitude":14.5865,"longitude":121.0572}]}` | `200` OK |
| `/admin/network` | LoRa Ping Diagnostic | `api.mesh.pingNode(nodeId)` | `POST /api/mesh/nodes/:id/ping` | None | None | `{"status":"success","node_id":"node-01","latency_ms":142,"last_seen":"2026-10-16T07:32:00Z","battery_level":94}` | `200` OK<br>`404` Node not found<br>`504` Ping timeout |
| `/admin/network` | Station LoRa Mesh Parameters | `api.mesh.getSettings()` | `GET /api/mesh/settings` | None | None | `{"status":"success","data":{"frequency_mhz":915.0,"bandwidth_khz":250,"spreading_factor":10,"coding_rate":"4/7","tx_power_dbm":20,"max_hops":3,"heartbeat_interval_seconds":300,"meshtastic_serial_port":"COM3"}}` | `200` OK |
| `/admin/network` | Save LoRa Parameters | `api.mesh.updateSettings(payload)` | `PUT /api/mesh/settings` | `Authorization: Bearer <token>` | `{"frequency_mhz":915.0,"bandwidth_khz":250,"spreading_factor":10,"coding_rate":"4/7","tx_power_dbm":20,"max_hops":3,"heartbeat_interval_seconds":300,"meshtastic_serial_port":"COM3"}` | `{"status":"success","data":{...}}` | `200` OK<br>`400` Parameter out of range |
| `/research/evaluation` | Research Benchmark Sessions | `api.evaluation.getSessions()` | `GET /api/evaluation/sessions` | None | None | `{"status":"success","data":[{"id":1,"session_name":"Flood Drill Benchmark A","status":"completed","target_packets":100,"interval_ms":2000,"start_time":"2026-10-16T06:00:00Z","end_time":"2026-10-16T06:15:00Z"}]}` | `200` OK |
| `/research/evaluation` | Start New Benchmark Session | `api.evaluation.createSession(payload)` | `POST /api/evaluation/sessions` | None | `{"session_name":"Stress Test Purok 2","simulated_nodes":5,"target_packets":50,"interval_ms":1000,"notes":"Simulating rain attenuation"}` | `{"status":"success","data":{"id":2,"session_name":"Stress Test Purok 2","status":"running",...}}` | `201` Created<br>`400` Missing parameter |
| `/research/evaluation` | End Benchmark Session | `api.evaluation.endSession(id)` | `POST /api/evaluation/sessions/:id/end` | None | None | `{"status":"success","data":{"id":2,"status":"completed","end_time":"..."}}` | `200` OK<br>`404` Session not found |
| `/research/evaluation` | Ingest Evaluation Test Packet | `api.evaluation.logPacket(sessionId, payload)` | `POST /api/evaluation/sessions/:id/packets` | None | `{"packet_id":"TEST-PKT-001","outcome":"delivered","hop_count":2,"delay_seconds":1.42,"rssi":-84,"snr":7.2,"send_time":"...","receive_time":"..."}` | `{"status":"success","data":{"id":101,...}}` | `201` Created |
| `/research/evaluation` | Calculate MDR & Delay Metrics | `api.evaluation.getMetrics(sessionId)` | `GET /api/evaluation/sessions/:id/metrics` | None | None | `{"status":"success","session":{...},"metrics":{"total_sent":100,"total_delivered":98,"total_lost":2,"mdr_percent":98.0,"avg_delay_seconds":1.45,"min_delay_seconds":0.82,"max_delay_seconds":2.95,"hop_breakdown":{"1_hop":{"sent":30,"delivered":30,"lost":0,"mdr_percent":100.0,"avg_delay_seconds":0.95},"2_hop":{"sent":50,"delivered":49,"lost":1,"mdr_percent":98.0,"avg_delay_seconds":1.42},"3_hop":{"sent":20,"delivered":19,"lost":1,"mdr_percent":95.0,"avg_delay_seconds":2.15}}}}` | `200` OK<br>`404` Not found |
| `/research/evaluation` | Export Research CSV | `api.evaluation.getExportCsvUrl(sessionId)` | `GET /api/evaluation/sessions/:id/export/csv` | None | None | Streaming `text/csv; charset=utf-8` file with: `Packet ID, Outcome, Hop Count, Delay (s), RSSI (dBm), SNR (dB), Send Time, Receive Time`. | `200` OK (Content-Disposition attachment) |
| `/handheld` & LoRa Ingestion | Mesh SOS Emergency Broadcast | `api.incidents.ingestPacket(payload)` | `POST /api/incidents/ingest` | None | `{"sender_id":"RES-1042","device_id":"HND-042","message_type":"medical","gps_lat":14.5842,"gps_lng":121.0583,"hop_count":2,"rssi":-88,"snr":6.5,"raw_payload":"LORA_RAW_HEX_0x42..."}` | `{"status":"success","incident_id":1,"is_duplicate":false,"is_registered_flag":1,"message":"Incident ingested successfully"}`<br>*(or if duplicate)*:<br>`{"status":"duplicate","incident_id":1,"is_duplicate":true,"is_registered_flag":1,"message":"Duplicate multi-hop packet suppressed"}` | `201` Created<br>`200` Duplicate Suppressed<br>`400` Invalid Packet |

---

## 3. Backend Business Logic Implementation Checklists

When building out or integrating your backend API against this UI, ensure your controllers satisfy the following core architectural requirements:

### Checklist 1: Duplicate Multi-Hop LoRa Packet Deduplication (`packet_hash`)
- [ ] **Problem**: In a LoRa mesh network, a single SOS packet broadcast by a resident's handheld is repeated by multiple repeater nodes. The base station typically receives the identical emergency broadcast 2 to 5 times within a 10-second window.
- [ ] **Hash Computation**: Calculate a deterministic hash upon reception:
  $$\text{packet\_hash} = \text{SHA256}(\text{sender\_id} + \text{message\_type} + \text{timestamp\_bucket})$$
  *(where timestamp bucket groups reports within a 3-minute window)*.
- [ ] **Suppression Rule**:
  - If a packet with the same `packet_hash` has already been recorded in SQLite within the deduplication window:
    - **DO NOT** create a new row in `incidents`.
    - **DO NOT** trigger a new sound chime or increment the pending badge count.
    - Optionally append the reception telemetry (`rssi`, `snr`, `hop_count`) to an audit log.
    - Return HTTP `200 OK` with JSON: `{"status": "duplicate", "is_duplicate": true, "incident_id": existingId}`.

### Checklist 2: Handling Unregistered or Deactivated Resident IDs (`is_registered_flag = 0`)
- [ ] **Life-Safety Mandate**: Never drop or discard an incoming emergency SOS broadcast because its `sender_id` or `device_id` is unrecognized or marked `is_active = 0`.
- [ ] **Database Lookup**:
  - Query `residents` by `user_id = :sender_id` OR `device_id = :device_id`.
  - **Case A (Registered & Active)**:
    - Set `is_registered_flag = 1`.
    - Populate `resident_name`, `resident_address`, and `medical_notes` directly onto the incident record.
  - **Case B (Unregistered, Unknown, or Inactive Device)**:
    - Set `is_registered_flag = 0`.
    - Set `resident_name` to `"Unregistered Handheld (ID: " + sender_id + ")"`.
    - Set `medical_notes` to `"None recorded (Unprovisioned device)"`.
    - Still record GPS coordinates and create the incident.
    - The frontend will prominently render an amber warning pill: **"Unregistered Device"** so barangay dispatchers are alerted to verify identity manually.

### Checklist 3: Timestamped Status Change Audit Trail (`incident_status_logs`)
- [ ] **Immutable History**: Every state transition on an incident (`reported` $\rightarrow$ `dispatched` $\rightarrow$ `resolved` $\rightarrow$ `false_alarm`) must create an audit record in `incident_status_logs`.
- [ ] **Required Columns**:
  - `incident_id`: Foreign key pointing to `incidents.id`.
  - `previous_status`: Previous status value (or `null` on creation).
  - `new_status`: Updated status value.
  - `changed_by_user_id`: ID of the authenticated operator who took the action.
  - `notes`: Dispatch log notes (e.g., "Barangay Tanod deployed via Patrol Vehicle 2").
  - `timestamp`: UTC ISO 8601 string (`strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`).
- [ ] **Endpoint Integrity**: When the frontend requests `GET /api/incidents/:id`, join or nest the `logs` array inside the response JSON ordered chronologically.

### Checklist 4: Isolation of Research Evaluation Test Sessions (`test_sessions` & `test_logs`)
- [ ] **Strict Traffic Separation**: The Researcher Evaluation Lab is designed to benchmark mesh network performance under stress (e.g., injecting 100 packets at 1000ms intervals).
- [ ] **Zero Live Pollution**:
  - All packets sent via `/api/evaluation/sessions/:id/packets` must be written exclusively to `test_logs`.
  - Under no circumstances should test packets appear in `incidents`, show up on the Live Incidents dashboard, or activate audio alarm synthesizers.
- [ ] **MDR Calculation Formula**:
  The metrics endpoint `GET /api/evaluation/sessions/:id/metrics` must compute:
  $$\text{MDR (\%)} = \left(\frac{\text{Delivered Packets}}{\text{Total Sent Packets}}\right) \times 100$$
  $$\text{Average Delay (s)} = \frac{\sum \text{delay\_seconds}}{\text{Delivered Packets}}$$
  Along with breakdown grouped by `hop_count` (1-hop, 2-hop, 3-hop).

### Checklist 5: Meshtastic USB Serial Packet Format & ACK Structure
- [ ] **Baud Rate & Port**: Typically `115200` baud over USB Serial (`/dev/ttyUSB0` on Linux, `COM3` on Windows).
- [ ] **Incoming Frame Structure**:
  ```json
  {
    "from": "!a4b1c201",
    "to": "^all",
    "type": "EMERGENCY_SOS",
    "sender_id": "RES-1042",
    "device_id": "HND-042",
    "emergency_type": "medical",
    "gps_lat": 14.5842,
    "gps_lng": 121.0583,
    "hop_count": 2,
    "rx_rssi": -88,
    "rx_snr": 6.5,
    "timestamp": 1729068000
  }
  ```
- [ ] **Outgoing Mesh Acknowledgment (ACK) Frame**:
  Immediately upon persisting the incident into SQLite, the base station station transmits an ACK packet back into the mesh:
  ```json
  {
    "to": "!a4b1c201",
    "type": "ROUTER_ACK",
    "ack_id": "INC-2026-084",
    "status": "DISPATCH_RECEIVED",
    "timestamp": 1729068002
  }
  ```
  *(The handheld citizen simulator on `/handheld` confirms reception when this ACK format is received)*.

---

## 4. Frontend Architecture & Styling Guidelines

If you need to make frontend adjustments or add new views:
- **Design Tokens**: Standardized in `tailwind.config.js` with soft slate canvas (`#F8FAFC`), white cards (`#FFFFFF`), `rounded-2xl` / `rounded-3xl` corners, and subtle diffused shadows.
- **Role-Based Guards**: Controlled via `src/context/AuthContext.jsx`. The 3 roles are:
  - `official`: Access to Live Incidents, Offline Map, History.
  - `administrator`: Full access including Residents Directory and Network Station Diagnostics.
  - `researcher`: Dedicated access to Research Evaluation Lab, Offline Map, History.
- **Audio Synthesizer**: Uses Web Audio API in `src/utils/audio.js` with zero external audio MP3 dependencies.

---

*METHORE Offline LoRa Mesh Subsystem • Standalone UI Handoff Specification*
