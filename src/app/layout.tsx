import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stop, Drop and Roll | BJJ Open Mat Radar",
  description: "The ultimate BJJ open mat radar. Find local jiu-jitsu gyms, check real-time open mat schedules, and discover your next roll anywhere in the world.",
  keywords: ["BJJ", "Brazilian Jiu Jitsu", "Open Mat", "Jiu Jitsu Gym Finder", "BJJ Training"],
  authors: [{ name: "Stop, Drop and Roll Team" }],
  openGraph: {
    title: "Stop, Drop and Roll | BJJ Open Mat Radar",
    description: "Discover BJJ open mats near you. Real-time schedules, facility details, and community-verified info.",
    type: "website",
    siteName: "Stop, Drop and Roll",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stop, Drop and Roll | BJJ Open Mat Radar",
    description: "Find your next BJJ open mat. Anywhere, anytime.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
