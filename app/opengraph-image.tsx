import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#0f1619",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px 100px",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        {/* Gradient accent band at top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "linear-gradient(90deg, #1aecff 0%, #00bde3 100%)",
          }}
        />

        {/* Tile + wordmark row */}
        <div style={{ display: "flex", alignItems: "center", gap: 28, marginBottom: 40 }}>
          {/* Petrol tile */}
          <div
            style={{
              width: 72,
              height: 72,
              background: "#00bde3",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="44"
              height="52"
              viewBox="12 11 16 28"
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

          {/* Text */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span
              style={{
                fontSize: 56,
                fontWeight: 700,
                color: "rgba(245,252,255,0.9)",
                letterSpacing: "-1px",
              }}
            >
              RailShift
            </span>
            <span
              style={{
                fontSize: 56,
                fontWeight: 700,
                color: "#00bde3",
                letterSpacing: "4px",
              }}
            >
              APAC
            </span>
          </div>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: 28,
            color: "rgba(229,247,255,0.65)",
            margin: 0,
            fontWeight: 400,
            maxWidth: 700,
            lineHeight: 1.4,
          }}
        >
          Rail strategy &amp; decarbonisation cockpit for Asia-Pacific
        </p>

        {/* Disclaimer */}
        <p
          style={{
            position: "absolute",
            bottom: 48,
            left: 100,
            fontSize: 16,
            color: "rgba(219,244,255,0.4)",
            margin: 0,
          }}
        >
          Independent analytical prototype. Not affiliated with or endorsed by Siemens.
        </p>
      </div>
    ),
    { ...size }
  );
}
