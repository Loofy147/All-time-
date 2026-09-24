import { ImageResponse } from "next/og";

export const runtime = "edge";
export const contentType = "image/png";

export async function GET() {
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
          fontSize: 96,
          fontWeight: 800,
          borderRadius: 32,
        }}
      >
        A
      </div>
    ),
    { width: 192, height: 192 },
  );
}
