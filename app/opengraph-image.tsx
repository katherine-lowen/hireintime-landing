// app/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 64,
          backgroundColor: "#ffffff", // solid background (supported)
          color: "#0b0b0b",
          fontFamily: "Inter, ui-sans-serif, system-ui",
        }}
      >
        <div style={{ fontSize: 18, opacity: 0.7 }}>Intime</div>
        <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.1, marginTop: 12 }}>
          The time-aware HR platform
        </div>
        <div style={{ fontSize: 24, opacity: 0.75, marginTop: 10 }}>
          Unified hiring, onboarding, scheduling & performance.
        </div>
      </div>
    ),
    size
  );
}
