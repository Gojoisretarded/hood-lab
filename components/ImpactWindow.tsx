// Impact v1 from spec section 08. No scores until the market pipeline has a baseline,
// so the panel shows the formula itself rather than invented numbers.
const SIGNALS: [string, number][] = [
  ["Volume acceleration", 25],
  ["Active wallets", 20],
  ["Liquidity quality", 15],
  ["Price momentum", 15],
  ["Market-cap change", 10],
  ["Onchain activity", 10],
  ["Social attention", 5],
];

export function ImpactWindow() {
  return (
    <section className="card panel impact" aria-labelledby="impact-title">
      <div className="panel__head">
        <h2 id="impact-title">Impact</h2>
        <span className="chip chip--pending">
          <i aria-hidden="true" />
          No scores yet
        </span>
      </div>
      <p className="panel__lede">
        Impact will rank the assets making the biggest meaningful move right now, and show why each one ranks where it
        does. Version 1 weighs seven signals.
      </p>
      <div className="weights" aria-hidden="true">
        {SIGNALS.map(([name, weight], i) => (
          <span key={name} style={{ flexGrow: weight, ["--shade" as string]: i }} />
        ))}
      </div>
      <ol className="weights__legend">
        {SIGNALS.map(([name, weight], i) => (
          <li key={name}>
            <i style={{ ["--shade" as string]: i }} aria-hidden="true" />
            <span>{name}</span>
            <span className="weights__pct">{weight}%</span>
          </li>
        ))}
      </ol>
      <p className="panel__foot">
        Scores appear once the market pipeline has a trailing baseline to compare against. Until then this panel shows
        the formula, never placeholder numbers.
      </p>
    </section>
  );
}
