import type { Metadata, Viewport } from 'next';
import { Roboto_Mono } from 'next/font/google';
import './globals.css';

// Roboto Mono comes from Google Fonts via next/font (self-hosted at build time,
// no runtime request). Satoshi is not on Google Fonts, so it loads from
// Fontshare — see the <link> below.
const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Time Machine — $100 in NVIDIA, 1999 to 2026',
  description:
    "$100 invested at NVIDIA's 1999 IPO would be worth $894,680 today. A scroll through every year that moved it.",
  openGraph: {
    title: 'Time Machine — $100 in NVIDIA',
    description: "From $100 at the 1999 IPO to $894,680. Every year that moved the number.",
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#060706',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={robotoMono.variable}>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
