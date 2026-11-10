import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "https://findamine.app/browse/standards" },
};

export default function StandardsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
