import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "All-time — Local Model Lab",
  description: "Browser-first experiments with compact open models.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
