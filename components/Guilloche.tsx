// Engraved rosette in the manner of a share certificate border. Generated, not traced,
// so it is our own artwork. Each ring is a circle modulated by a sine wave; pairs of rings
// with offset phase produce the woven look.
const RINGS = [
  { r: 210, a: 64, k: 12, phase: 0 },
  { r: 210, a: 64, k: 12, phase: Math.PI / 12 },
  { r: 300, a: 54, k: 18, phase: 0 },
  { r: 300, a: 54, k: 18, phase: Math.PI / 18 },
  { r: 390, a: 36, k: 30, phase: 0 },
  { r: 390, a: 36, k: 30, phase: Math.PI / 30 },
  { r: 460, a: 18, k: 48, phase: 0 },
];

function ring({ r, a, k, phase }: (typeof RINGS)[number]) {
  const steps = 600;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const rad = r + a * Math.sin(k * t + phase);
    const x = 500 + rad * Math.cos(t);
    const y = 500 + rad * Math.sin(t);
    d += `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return `${d}Z`;
}

const PATHS = RINGS.map(ring);

export function Guilloche({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1000 1000" className={className} aria-hidden="true" focusable="false">
      {PATHS.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
