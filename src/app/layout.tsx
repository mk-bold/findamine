import type { Metadata } from "next";
import "./globals.css";
import { AgeBandProvider } from "@/lib/themes/age-band-provider";

export const metadata: Metadata = {
  title: "Findamine - GPS Treasure Hunting Adventures",
  description:
    "Location-based educational scavenger hunts for classrooms and families.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AgeBandProvider initialBand="intermediate">
          {children}
        </AgeBandProvider>
      </body>
    </html>
  );
}
