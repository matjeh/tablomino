import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { CSP_META } from "@/lib/csp";

const isCapacitor = process.env.BUILD_TARGET === 'capacitor';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tablomino",
  description:
    "Apprends les tables d'addition, soustraction, multiplication et division en jouant.",
  applicationName: "Tablomino",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tablomino",
  },
};

export const viewport: Viewport = {
  themeColor: "#6ee7b7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {/* Root layouts shouldn't manually render a <head> (fights the
            Metadata API's de-duplication) -- but the Metadata API has no
            http-equiv support, so this relies on React 19's automatic
            hoisting of <meta>/<title>/<link> tags to <head> instead. */}
        {isCapacitor && <meta httpEquiv="Content-Security-Policy" content={CSP_META} />}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
