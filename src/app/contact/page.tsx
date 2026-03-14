import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-white">
      <div className="max-w-xl w-full bg-[#1a1a1a] p-12 rounded-3xl border-b-8 border-[#ff1493] shadow-2xl">
        <h2 className="font-russo text-[#39ff14] text-4xl md:text-5xl mb-6 uppercase tracking-tighter">
          CONTACT US
        </h2>
        <div className="space-y-6 text-gray-300 font-archivo text-lg">
          <p>
            Got a correction? Want to affiliate? Just want to talk shop?
          </p>
          <div className="p-6 bg-black/20 rounded-xl border-2 border-dashed border-[#ff1493]/30">
            <p className="text-[#ff1493] font-black uppercase text-2xl mb-2">
              HELLO@SDR.ROLL
            </p>
            <p className="text-sm font-black text-gray-500 uppercase">
              REPLIES WITHIN 1 TRAINING SESSION.
            </p>
          </div>
          <p className="mt-8 text-[#39ff14] font-black uppercase">
            DM US ON INSTAGRAM: <span className="text-white">@SDR_RADAR</span>
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
