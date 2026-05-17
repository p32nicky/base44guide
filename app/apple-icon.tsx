import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: "40px",
          background: "linear-gradient(135deg, #f97316, #ea580c)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: 72,
          fontWeight: 800,
          fontFamily: "sans-serif",
          letterSpacing: "-2px",
        }}
      >
        44
      </div>
    ),
    { ...size }
  );
}
