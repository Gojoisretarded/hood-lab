// A jet airliner seen from above, nose pointing right so rotation equals the route's tangent.
// Original drawing. The cheatline and fin take the active direction's accent colour, so the
// livery changes with the style.
export function Airplane() {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" focusable="false">
      <g stroke="rgba(20, 24, 22, 0.45)" strokeWidth="0.6" strokeLinejoin="round">
        {/* horizontal stabilisers */}
        <path d="M23 46 L12.5 31 L8.5 31 L15 46 Z" fill="#e4e6e1" />
        <path d="M23 54 L12.5 69 L8.5 69 L15 54 Z" fill="#d5d8d2" />

        {/* main wings, swept back; the far wing sits slightly in shade */}
        <path d="M63 45 L37 9 L30.5 9 L44 45 Z" fill="#e9ebe6" />
        <path d="M63 55 L37 91 L30.5 91 L44 55 Z" fill="#d9dcd6" />

        {/* engine nacelles, hung ahead of the leading edge */}
        <rect x="45" y="25.4" width="14" height="6" rx="3" fill="#bfc3bc" />
        <rect x="45" y="68.6" width="14" height="6" rx="3" fill="#b3b7b0" />

        {/* fuselage */}
        <path
          d="M96 50 C96 46.2 91 44.4 84 44.4 L19 45.1 C13.5 45.4 9 47.2 7.5 50 C9 52.8 13.5 54.6 19 54.9 L84 55.6 C91 55.6 96 53.8 96 50 Z"
          fill="#f4f5f2"
        />
      </g>

      {/* underside shading along the fuselage */}
      <path d="M84 55.6 C91 55.6 96 53.8 96 50 L20 50 L19 54.9 Z" fill="rgba(20, 24, 22, 0.08)" />

      {/* flap lines */}
      <g stroke="rgba(20, 24, 22, 0.28)" strokeWidth="0.5" fill="none">
        <path d="M46 42 L33.5 13" />
        <path d="M46 58 L33.5 87" />
      </g>

      {/* engine intakes */}
      <rect x="57.2" y="26.4" width="1.6" height="4" rx="0.8" fill="#3d423d" />
      <rect x="57.2" y="69.6" width="1.6" height="4" rx="0.8" fill="#3d423d" />

      {/* livery: cheatline and fin in the accent colour */}
      <path d="M86 49.2 L24 49.4 L24 50.6 L86 50.8 Z" style={{ fill: "var(--accent, #2336b0)" }} />
      <path d="M8.5 49 L21 49.2 L21 50.8 L8.5 51 Z" style={{ fill: "var(--accent, #2336b0)" }} />

      {/* cockpit glazing */}
      <path d="M88.4 47 Q92.4 47.8 93.2 50 Q92.4 52.2 88.4 53 Q89.6 50 88.4 47 Z" fill="#2c3440" />

      {/* navigation lights: red to port, green to starboard */}
      <circle cx="31.5" cy="9.8" r="1.3" fill="#e5484d" />
      <circle cx="31.5" cy="90.2" r="1.3" fill="#3dbb6b" />
    </svg>
  );
}
