import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-white">
      <div className="max-w-md w-full bg-[#1a1a1a] p-12 rounded-3xl border-b-8 border-[#ff1493] shadow-2xl">
        <h2 className="font-russo text-[#39ff14] text-4xl md:text-5xl mb-6 uppercase tracking-tighter">
          GYM LOGIN
        </h2>
        <div className="space-y-6 text-gray-300 font-archivo text-lg">
          <p>
            The Gym Owner Dashboard is in private beta. Manage your schedule, verify your mats, and talk directly to travelers.
          </p>
          <div className="p-8 bg-black/40 rounded-xl border-2 border-[#ff1493] text-white">
            <p className="text-[#39ff14] font-black uppercase text-xl mb-4">
              OWNER PORTAL EARLY ACCESS
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Enter your invitation code to access the dashboard.
            </p>
            <input 
              type="text" 
              placeholder="SDR-XXXX-XXXX" 
              className="w-full bg-[#222] border-2 border-gray-800 p-3 rounded text-center text-[#ff1493] font-russo uppercase mb-4"
              disabled
            />
            <button className="w-full bg-gray-800 text-gray-500 font-russo py-3 rounded cursor-not-allowed">
              ENTER DASHBOARD
            </button>
          </div>
          <p className="text-sm font-black text-gray-500 uppercase">
            NO INVITE? <Link href="/contact" className="text-[#ff1493] hover:underline">CONTACT US</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
