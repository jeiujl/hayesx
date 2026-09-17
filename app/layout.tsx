import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HayesX | Flight Companion",
  description: "Your HayesX-250 preflight checklist, flight logbook and aircraft manuals.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
