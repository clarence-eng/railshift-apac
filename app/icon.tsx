import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Petrol tile with the rail-grid mark — matches the SVG tile section exactly
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#00bde3",
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="22"
          height="26"
          viewBox="14 11 14 28"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="square"
        >
          <path d="M14 37 L18.5 13" />
          <path d="M26 37 L21.5 13" />
          <line x1="12.5" y1="34" x2="27.5" y2="34" />
          <line x1="14.5" y1="27" x2="25.5" y2="27" />
          <line x1="16" y1="20.5" x2="24" y2="20.5" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
