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
          fontSize: 250,
          fontWeight: 800,
          borderRadius: 96,
        }}
      >
        A
      </div>
    ),
    { width: 512, height: 512 },
  );
}
