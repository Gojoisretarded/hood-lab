export const money = (v: number, cents = v < 10000): string =>
  '$' +
  v.toLocaleString('en-US', {
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  });

export const pct = (v: number | null): string =>
  v === null ? '—' : `${v > 0 ? '+' : '−'}${Math.abs(v).toFixed(1)}%`;

export const compact = (v: number): string =>
  v >= 1000
    ? '$' + (v / 1000).toLocaleString('en-US', { maximumFractionDigits: v < 10000 ? 1 : 0 }) + 'k'
    : '$' + v.toFixed(0);
