import Link from "next/link";

export default function ClaCoachingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-white">
      <div className="max-w-2xl w-full bg-[#1a1a1a] p-12 rounded-3xl border-b-8 border-[#ff1493] shadow-2xl">
        <h2 className="font-russo text-[#39ff14] text-4xl md:text-5xl mb-6 uppercase tracking-tighter">
          CLA COACHING
        </h2>
        <div className="space-y-6 text-gray-300 font-archivo text-lg">
          <p className="text-2xl font-black uppercase text-[#ff1493]">
            Constraint Led Approach
          </p>
          <p>
            Stop drilling. Start rolling. Our CLA-based coaching protocols are designed to accelerate your BJJ development through ecological dynamics and representative learning.
          </p>
          <div className="p-8 bg-black/20 rounded-xl border-2 border-[#39ff14] text-[#39ff14] font-black uppercase text-xl animate-pulse">
            VIRTUAL CLINICS COMING SOON
          </div>
          <p className="text-sm italic text-gray-500">
            Learn how to design training environments that actually build skill.
          </p>
        </div>
        <div className="mt-10">
          <Link 
            href="/search" 
            className="bg-[#39ff14] text-[#1a1a1a] font-russo text-xl px-8 py-4 no-underline uppercase transition-transform hover:scale-105 active:scale-95 inline-block"
          >
            Notify Me When It&apos;s Live
          </Link>
        </div>

      </div>
    </div>
  );
}
