// Incident timestamps arrive as ISO strings with mixed offsets (seed data is
// +08:00, packets ingested at runtime are UTC "Z"). Slicing the string shows
// the wrong clock, so everything displayed goes through Date and the viewer's
// local time zone.

const parse = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
};

const pad = (n) => String(n).padStart(2, '0');

export function formatClock(iso, { seconds = true } = {}) {
  const d = parse(iso);
  if (!d) return seconds ? '--:--:--' : '--:--';
  const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return seconds ? `${hm}:${pad(d.getSeconds())}` : hm;
}

export function formatDate(iso) {
  const d = parse(iso);
  if (!d) return '----------';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function timeValue(iso) {
  const d = parse(iso);
  return d ? d.getTime() : 0;
}
