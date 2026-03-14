"use client";

import Link from "next/link";

export function HeaderActions() {
  return (
    <nav className="hidden md:flex items-center">
      <Link href="/about" className="text-white no-underline ml-5 font-black uppercase text-sm">About</Link>
      <Link href="/contact" className="text-white no-underline ml-5 font-black uppercase text-sm">Contact</Link>
      <Link href="/login" className="bg-[#1a1a1a] text-[#39ff14] ml-5 px-[15px] py-2 rounded-sm border-2 border-[#39ff14] font-black uppercase text-sm">
        Gym Login
      </Link>
    </nav>
  );
}
