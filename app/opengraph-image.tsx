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

        {/* Wordmark row — Siemens-style */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 40 }}>
          <span
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#009999",
              letterSpacing: "4px",
              fontFamily: "Arial, Helvetica, sans-serif",
            }}
          >
            SIEMENS
          </span>
          <div style={{ width: 2, height: 52, background: "#009999", opacity: 0.35, alignSelf: "center" }} />
          <span
            style={{
              fontSize: 36,
              fontWeight: 400,
              color: "#009999",
              letterSpacing: "2px",
              fontFamily: "Arial, Helvetica, sans-serif",
            }}
          >
            RailShift APAC
          </span>
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

        {/* Attribution */}
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
          Rail strategy &amp; decarbonisation cockpit — Asia-Pacific
        </p>
      </div>
    ),
    { ...size }
  );
}
