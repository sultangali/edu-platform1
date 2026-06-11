// Lightweight SVG plot of y = a·x² + b·x + c with axes, the vertex and
// x-intercepts marked. Used to visualise the quadratic in problem-based tasks.

export default function ParabolaGraph({ a, b, c, width = 360, height = 240, color = '#d946ef' }) {
  if (a === undefined || a === null || a === 0) return null;

  const f = (x) => a * x * x + b * x + c;
  const vx = -b / (2 * a);
  const vy = f(vx);

  // Pick an x-window that frames the vertex (and roots, if real).
  const disc = b * b - 4 * a * c;
  let span = 6;
  if (disc > 0) {
    const r = Math.sqrt(disc) / (2 * Math.abs(a));
    span = Math.max(span, r * 1.6);
  }
  const xMin = vx - span;
  const xMax = vx + span;

  // Sample to get the y-window.
  const N = 80;
  const pts = [];
  let yMin = vy, yMax = vy;
  for (let i = 0; i <= N; i++) {
    const x = xMin + ((xMax - xMin) * i) / N;
    const y = f(x);
    pts.push([x, y]);
    if (y < yMin) yMin = y;
    if (y > yMax) yMax = y;
  }
  // Pad and make sure y=0 shows.
  yMin = Math.min(yMin, 0);
  yMax = Math.max(yMax, 0);
  const padY = (yMax - yMin) * 0.1 || 1;
  yMin -= padY;
  yMax += padY;

  const pad = 24;
  const sx = (x) => pad + ((x - xMin) / (xMax - xMin)) * (width - 2 * pad);
  const sy = (y) => height - pad - ((y - yMin) / (yMax - yMin)) * (height - 2 * pad);

  const path = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(' ');

  const axisX0 = xMin <= 0 && 0 <= xMax ? sx(0) : null;
  const axisY0 = yMin <= 0 && 0 <= yMax ? sy(0) : null;

  const roots = disc > 0
    ? [(-b - Math.sqrt(disc)) / (2 * a), (-b + Math.sqrt(disc)) / (2 * a)]
    : disc === 0 ? [vx] : [];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto rounded-2xl bg-slate-50 border border-slate-200">
      {/* grid frame */}
      <rect x="0.5" y="0.5" width={width - 1} height={height - 1} rx="14" fill="white" stroke="#e2e8f0" />
      {/* axes */}
      {axisY0 !== null && <line x1={pad} y1={axisY0} x2={width - pad} y2={axisY0} stroke="#cbd5e1" strokeWidth="1.5" />}
      {axisX0 !== null && <line x1={axisX0} y1={pad} x2={axisX0} y2={height - pad} stroke="#cbd5e1" strokeWidth="1.5" />}
      {/* parabola */}
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      {/* roots */}
      {roots.map((r, i) =>
        (r >= xMin && r <= xMax && axisY0 !== null) ? (
          <circle key={i} cx={sx(r)} cy={axisY0} r="3.5" fill="#0ea5e9" />
        ) : null
      )}
      {/* vertex */}
      <circle cx={sx(vx)} cy={sy(vy)} r="4.5" fill={color} stroke="white" strokeWidth="1.5" />
      <text x={sx(vx)} y={sy(vy) - 8} textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="700">
        ({+vx.toFixed(2)}; {+vy.toFixed(2)})
      </text>
    </svg>
  );
}
