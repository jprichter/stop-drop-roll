import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-white">
      <div className="max-w-2xl w-full bg-[#1a1a1a] p-12 rounded-3xl border-b-8 border-[#ff1493] shadow-2xl">
        <h2 className="font-russo text-[#39ff14] text-4xl md:text-5xl mb-6 uppercase tracking-tighter">
          OUR MISSION
        </h2>
        <div className="space-y-6 text-gray-300 font-archivo text-lg">
          <p>
            Stop, Drop &amp; Roll was born on the mats. We&apos;re tired of outdated gym websites, dead Instagram links, and the &quot;just DM us&quot; culture of finding open mats.
          </p>
          <p className="text-[#ff1493] font-black uppercase text-xl">
            COMING SOON: THE MAT PASS
          </p>
          <p>
            We are building a global network of affiliate gyms. One membership, unlimited rolls. Whether you&apos;re in Austin, London, or Tokyo, your next roll is just one tap away.
          </p>
        </div>
        <div className="mt-10">
          <Link 
            href="/search" 
            className="bg-[#39ff14] text-[#1a1a1a] font-russo text-xl px-8 py-4 no-underline uppercase transition-transform hover:scale-105 active:scale-95 inline-block"
          >
            Back to the Map
          </Link>
        </div>
      </div>
    </div>
  );
}
