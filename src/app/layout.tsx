import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "findamine - GPS Treasure Hunting Adventures",
  description:
    "Location-based educational scavenger hunts for classrooms and families.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: "16px" }}>
        {children}
      </body>
    </html>
  );
}
