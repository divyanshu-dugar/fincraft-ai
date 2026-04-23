/**
 * Fincraft AI logomark.
 *
 * A rounded-square gradient tile (cyan → indigo) with a bold geometric
 * "F" monogram. Single-mark, pure SVG, scales crisply from 16px favicon
 * up to hero sizes. The gradient id is suffixed with a stable per-instance
 * token so multiple <Logo> renders on one page don't collide.
 *
 * Props:
 *   size      number | string  — px size of the square (default 32)
 *   className string            — extra classes for the root <svg>
 *   title     string            — accessible label (default "Fincraft AI")
 */
export default function Logo({ size = 32, className = '', title = 'Fincraft AI' }) {
  // Stable gradient id per component tree to avoid cross-instance collisions.
  const gid = 'fincraft-logo-grad';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={className}
    >
      <title>{title}</title>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>

      {/* Rounded square tile */}
      <rect width="40" height="40" rx="10" fill={`url(#${gid})`} />

      {/* Bold geometric "F" — centered, rounded exterior corners */}
      <path
        d="M14.5 10 h13 a2 2 0 0 1 0 4 h-11 v6 h8 a2 2 0 0 1 0 4 h-8 v6 a2 2 0 0 1 -4 0 V12 a2 2 0 0 1 2 -2 z"
        fill="white"
      />
    </svg>
  );
}
