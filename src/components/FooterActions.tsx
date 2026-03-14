"use client";

import Link from "next/link";
import { useModals } from "@/lib/modal-context";

export function FooterActions() {
  const { openAddGymModal } = useModals();

  return (
    <div className="mb-4 flex flex-wrap justify-center gap-4">
      <Link href="/about" className="text-[#ff1493] no-underline text-xs font-black uppercase">ABOUT</Link>
      <Link href="/contact" className="text-[#ff1493] no-underline text-xs font-black uppercase">CONTACT</Link>
      <Link href="/cla-coaching" className="text-[#ff1493] no-underline text-xs font-black uppercase">CLA COACHING</Link>
      <button 
        onClick={() => openAddGymModal()}
        className="text-[#ff1493] no-underline text-xs font-black uppercase cursor-pointer hover:underline"
      >
        ADD A GYM
      </button>
    </div>
  );
}
