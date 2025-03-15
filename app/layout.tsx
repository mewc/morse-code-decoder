import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "International Morse Decoding",
  description: "Interactive Morse code visualization and decoding with sound",
  keywords: [
    "morse code",
    "decoder",
    "visualization",
    "interactive",
    "sound",
    "learning",
    "communication",
  ],
  authors: [{ name: "Morse Code Visualizer" }],
  creator: "Morse Code Visualizer",
  publisher: "Morse Code Visualizer",
  robots: "index, follow",
  metadataBase: new URL("https://morse-code-viz.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://morse-code-viz.vercel.app",
    title: "International Morse Decoding",
    description: "Interactive Morse code visualization and decoding with sound",
    siteName: "Morse Code Visualizer",
    images: [
      {
        url: "/ogimg.png",
        width: 1200,
        height: 630,
        alt: "Morse Code Visualizer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "International Morse Decoding",
    description: "Interactive Morse code visualization and decoding with sound",
    images: ["/ogimg.png"],
    creator: "@morsecodeviz",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  alternates: {
    canonical: "https://morse-code-viz.vercel.app",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-B5NZ8KP0S1"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-B5NZ8KP0S1');
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
