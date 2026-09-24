import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b1420",
          color: "#f4f7fb",
          fontSize: 34,
          fontWeight: 800,
          borderRadius: 14,
        }}
      >
        A
      </div>
    ),
    size,
  );
}
