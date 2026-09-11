// Film grain over the whole site. A small SVG noise tile, repeated, at very low strength.
// The tile is set inline because the CSS pipeline rewrites url() values in stylesheets.
const NOISE = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`,
)}")`;

export function Grain() {
  return <div className="grain" aria-hidden="true" style={{ backgroundImage: NOISE }} />;
}
