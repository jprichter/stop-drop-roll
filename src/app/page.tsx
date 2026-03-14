import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)]">
      {/* Hero / CTA Section */}
      <section 
        className="flex-grow flex flex-col justify-center items-center text-center p-5 md:p-10 relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=2000&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="bg-[#1a1a1a] p-8 md:p-12 rounded-lg border-b-8 border-[#ff1493] shadow-[0_20px_40px_rgba(0,0,0,0.3)] max-w-2xl w-full z-10">
          <h2 className="font-russo text-white text-4xl md:text-6xl mb-6 uppercase tracking-tighter leading-none">
            READY TO ROLL?
          </h2>
          <p className="text-gray-400 text-lg md:text-xl mb-10 font-archivo">
            Find the best open mats and drop-in friendly gyms near you.
          </p>
          <Link 
            href="/search" 
            className="bg-[#39ff14] text-[#1a1a1a] font-russo text-xl md:text-2xl px-10 py-5 no-underline uppercase transition-transform hover:scale-105 active:scale-95 inline-block shadow-[0_4px_0_rgb(34,197,94)]"
          >
            Find Open Mat Now
          </Link>
        </div>
        
        {/* Background elements to make it "Flashy" */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-[#39ff14] opacity-20 rotate-12"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 border-8 border-[#ff1493] opacity-10 -rotate-12"></div>
          <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-[#39ff14] rounded-full opacity-30"></div>
          <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-[#ff1493] rounded-full opacity-20"></div>
        </div>
      </section>

      {/* Trust Bar or Quick Info */}
      <section className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl mb-2">🗺️</div>
            <h3 className="font-russo text-[#1a1a1a] text-lg uppercase mb-2">Live Map</h3>
            <p className="text-sm text-gray-600">Real-time BJJ open mat discovery globally.</p>
          </div>
          <div>
            <div className="text-4xl mb-2">✅</div>
            <h3 className="font-russo text-[#1a1a1a] text-lg uppercase mb-2">Verified</h3>
            <p className="text-sm text-gray-600">Community-confirmed schedules you can trust.</p>
          </div>
          <div>
            <div className="text-4xl mb-2">🥋</div>
            <h3 className="font-russo text-[#1a1a1a] text-lg uppercase mb-2">Zero Friction</h3>
            <p className="text-sm text-gray-600">No accounts. Just roll. Find your next session in seconds.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
