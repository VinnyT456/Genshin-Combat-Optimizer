import { useId } from "react";
import styles from "@/app/home.module.css";

// Fixed projected ribbon: decorative geometry, no WebGL or animation loop.
function point(angle: number, edge: number) {
  const radius = 174 + edge * 58 * Math.cos(angle / 2);
  const x = radius * Math.cos(angle);
  const y = radius * Math.sin(angle);
  const z = edge * 58 * Math.sin(angle / 2);
  const tiltedY = y * 0.68 - z * 0.73;
  return { x: 310 + x * 0.94 + tiltedY * 0.34, y: 290 - x * 0.34 + tiltedY * 0.94, z: y * 0.73 + z * 0.68 };
}

const SEGMENTS = 96;
const facets = Array.from({ length: SEGMENTS }, (_, index) => {
  const angle = index / SEGMENTS * Math.PI * 2;
  const next = (index + 1) / SEGMENTS * Math.PI * 2;
  const points = [point(angle, -1), point(next, -1), point(next, 1), point(angle, 1)];
  const light = 22 + 42 * Math.pow((Math.sin(angle + 0.8) + 1) / 2, 3);
  return {
    points: points.map(({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" "),
    depth: points.reduce((sum, p) => sum + p.z, 0) / points.length,
    color: `hsl(185 48% ${light}%)`,
  };
}).sort((a, b) => a.depth - b.depth);

const contours = [-1, -0.9, -0.55, 0, 0.55, 0.9, 1].map((edge) =>
  Array.from({ length: SEGMENTS + 1 }, (_, index) => {
    const p = point(index / SEGMENTS * Math.PI * 2, edge);
    return `${index === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(" "),
);

export function OrbitalField() {
  const id = useId().replaceAll(":", "");
  return (
    <div className={styles.orbitalField} aria-hidden="true">
      <svg viewBox="0 0 620 620" role="presentation" focusable="false">
        <defs>
          <radialGradient id={`${id}-halo`}>
            <stop stopColor="#296775" stopOpacity="0.22" />
            <stop offset="1" stopColor="#080c10" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${id}-edge`} x1="0" x2="1" y1="0" y2="1">
            <stop stopColor="#d4ff5f" /><stop offset="0.45" stopColor="#b4fcff" /><stop offset="1" stopColor="#327e8c" />
          </linearGradient>
        </defs>
        <circle cx="310" cy="290" r="285" fill={`url(#${id}-halo)`} />
        <g fill="none" stroke="#34545e" strokeWidth="0.8">
          <circle cx="310" cy="290" r="256" strokeDasharray="2 10" />
          <path d="M32 290h46m464 0h46M310 12v34m0 488v34" />
          <ellipse cx="310" cy="290" rx="278" ry="76" transform="rotate(-28 310 290)" />
        </g>
        <g strokeWidth="0.4">
          {facets.map((facet, index) => <polygon key={index} points={facet.points} fill={facet.color} stroke={facet.color} />)}
        </g>
        <g fill="none" stroke={`url(#${id}-edge)`}>
          {contours.map((path, index) => <path key={index} d={path} strokeWidth={index === 0 || index === 6 ? 1.5 : 0.6} opacity={index === 0 || index === 6 ? 0.95 : 0.38} />)}
        </g>
        <g fill="none" stroke="#d4ff5f" strokeWidth="1">
          <path d="M286 281v-15h15m38 33v15h-15M307 290h7m-3.5-3.5v7" />
        </g>
        <g fill="#a1c3c6" fontFamily="ui-monospace, monospace" fontSize="10" letterSpacing="2">
          <text x="65" y="505">ROTATION / CLOSED LOOP</text>
          <text x="65" y="524" fill="#69e5ed">INPUT → SIMULATE → REFINE</text>
        </g>
        <path d="M457 497h70m-70 7h45m-45 7h58" stroke="#69e5ed" strokeWidth="2" opacity="0.6" />
      </svg>
    </div>
  );
}
