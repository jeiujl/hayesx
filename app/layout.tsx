import type { Metadata, Viewport } from "next";
import { THEME_SCRIPT } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "HayesX",
  description:
    "Preflight checklist, digital logbook and manuals for the HayesX-250 eVTOL.",
  applicationName: "HayesX",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "HayesX", statusBarStyle: "default" },
  icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef1f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f16" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // The checklist must stay legible at large type sizes.
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="day" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
