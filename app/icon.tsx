import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Petrol square with bold "S" Siemens lettermark
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#009999",
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "#ffffff",
            fontSize: 22,
            fontWeight: 700,
            lineHeight: 1,
            fontFamily: "sans-serif",
          }}
        >
          S
        </span>
      </div>
    ),
    { ...size }
  );
}
