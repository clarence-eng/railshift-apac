import type { SVGProps } from "react";

/**
 * RailShift APAC wordmark — inline SVG React component.
 *
 * Inherits theme automatically:
 *   - Tile rect + "APAC" text: fill="var(--primary, #00bde3)" → petrol in both themes
 *   - "RailShift" text: fill="currentColor" → inherits CSS color (foreground token)
 *   - White rail-grid strokes are baked in (correct on the petrol tile in both themes)
 *
 * Never use as <img>. Render inline so CSS custom properties resolve.
 */
export default function RailShiftWordmark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 300 48"
      role="img"
      aria-label="RailShift APAC"
      {...props}
    >
      {/* Petrol tile */}
      <rect x="0" y="4" width="40" height="40" rx="2" fill="var(--primary, #00bde3)" />

      {/* Rail-grid motif — white strokes on petrol tile */}
      <g stroke="#ffffff" strokeWidth="2" strokeLinecap="square" fill="none">
        <path d="M14 37 L18.5 13" />
        <path d="M26 37 L21.5 13" />
        <line x1="12.5" y1="34" x2="27.5" y2="34" />
        <line x1="14.5" y1="27" x2="25.5" y2="27" />
        <line x1="16" y1="20.5" x2="24" y2="20.5" />
      </g>

      {/* "RailShift" — follows theme text color via currentColor */}
      <text
        x="52"
        y="32"
        fontFamily="'Siemens Sans', Arial, Helvetica, sans-serif"
        fontSize="25"
        fontWeight="700"
        letterSpacing="-0.3"
        fill="currentColor"
      >
        RailShift
      </text>

      {/* "APAC" — always petrol */}
      <text
        x="178"
        y="32"
        fontFamily="'Siemens Sans', Arial, Helvetica, sans-serif"
        fontSize="25"
        fontWeight="700"
        letterSpacing="1.5"
        fill="var(--primary, #00bde3)"
      >
        APAC
      </text>
    </svg>
  );
}
