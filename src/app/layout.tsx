import type { Metadata } from "next";
import { Geist, Geist_Mono, Russo_One, Archivo } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { ModalProvider } from "@/lib/modal-context";
import { HeaderActions } from "@/components/HeaderActions";
import { FooterActions } from "@/components/FooterActions";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const russoOne = Russo_One({
  variable: "--font-russo-one",
  weight: "400",
  subsets: ["latin"],
});

const archivo = Archivo({
  variable: "--font-archivo",
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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${russoOne.variable} ${archivo.variable}`}>
      <body
        className="antialiased font-archivo min-h-screen flex flex-col"
      >
        <ModalProvider>
          <header className="bg-[#ff1493] p-4 flex justify-between items-center shadow-[0_4px_10px_rgba(0,0,0,0.2)] z-[100]">
            <Link href="/" className="flex items-center gap-[10px] text-white no-underline">
              <svg
                width="50"
                height="50"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10 md:w-12 md:h-12"
              >
                <path
                  d="M50 10 L90 85 L10 85 Z"
                  fill="none"
                  stroke="#39FF14"
                  strokeWidth="6"
                  strokeLinejoin="round"
                />
                <path
                  d="M50 25 L75 75 L25 75 Z"
                  fill="none"
                  stroke="#FF1493"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  opacity="0.8"
                />
                <circle
                  cx="50"
                  cy="58"
                  r="14"
                  fill="white"
                  stroke="#1a1a1a"
                  strokeWidth="2"
                />
                <text
                  x="50"
                  y="62"
                  fontFamily="'Russo One', sans-serif"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  fill="#1a1a1a"
                >
                  SDR
                </text>
              </svg>
              <h1 className="font-russo m-0 text-lg md:text-xl uppercase tracking-wider">
                Stop, Drop & Roll
              </h1>
            </Link>
            <HeaderActions />
          </header>

          <main className="flex-grow">
            {children}
          </main>

          <footer className="bg-[#1a1a1a] text-[#888] p-8 text-center mt-auto">
            <FooterActions />
            <p className="text-[10px] md:text-xs">&copy; 2026 STOP, DROP & ROLL. ESTABLISHED ON THE MATS.</p>
          </footer>
        </ModalProvider>
      </body>
    </html>
  );
}
