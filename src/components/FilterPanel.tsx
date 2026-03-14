"use client";

interface Filters {
  distance: number;
  giStyles: string[];
  maxFee: number | null;
  hasShower: boolean;
  hasLockers: boolean;
  hasParking: boolean;
}

interface FilterPanelProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  onApply: () => void;
}

export const FilterPanel = ({ filters, setFilters, onApply }: FilterPanelProps) => {
  const handleStyleChange = (style: string) => {
    const newStyles = filters.giStyles.includes(style)
      ? filters.giStyles.filter((s) => s !== style)
      : [...filters.giStyles, style];
    setFilters({ ...filters, giStyles: newStyles });
  };

  return (
    <div className="w-80 h-full bg-[#1a1a1a] flex flex-col p-6 shadow-2xl border-r border-[#ff1493] text-white">
      <div className="flex justify-between items-center mb-8 border-b border-[#ff1493] pb-4">
        <h3 className="text-2xl font-russo uppercase tracking-wider text-[#39ff14]">Filters</h3>
        <button onClick={onApply} className="text-[#ff1493] font-black text-sm hover:underline uppercase">Done</button>
      </div>

      <div className="flex-grow space-y-8 overflow-y-auto pr-2 no-scrollbar">
        {/* Distance Filter */}
        <section className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Distance</span>
            <span className="text-sm font-black text-[#39ff14] bg-[#39ff14]/10 border border-[#39ff14]/20 px-2 py-0.5 rounded-md">{filters.distance} miles</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={filters.distance}
            onChange={(e) => setFilters({ ...filters, distance: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#39ff14]"
          />
        </section>

        {/* Gi Style Filter */}
        <section className="space-y-3">
          <span className="text-sm font-black text-gray-400 uppercase tracking-widest block">Style</span>
          <div className="flex flex-wrap gap-2">
            {["gi", "no_gi", "both"].map((style) => (
              <button
                key={style}
                onClick={() => handleStyleChange(style)}
                className={`px-4 py-2 rounded-lg text-sm font-black border-2 transition-all uppercase ${
                  filters.giStyles.includes(style)
                    ? 'bg-[#ff1493] border-[#ff1493] text-white shadow-[0_4px_0_rgb(190,24,93)] active:translate-y-[2px] active:shadow-none'
                    : 'bg-transparent border-gray-700 text-gray-400 hover:border-[#ff1493] hover:text-[#ff1493]'
                }`}
              >
                {style === 'no_gi' ? 'no-gi' : style === 'both' ? 'gi and no-gi' : style}
              </button>
            ))}
          </div>
        </section>

        {/* Max Fee Filter */}
        <section className="space-y-3">
          <label className="text-sm font-black text-gray-400 uppercase tracking-widest block">
            Max Drop-in Fee ($)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#39ff14] font-black">$</span>
            <input
              type="number"
              placeholder="Any price"
              value={filters.maxFee || ""}
              onChange={(e) => setFilters({ ...filters, maxFee: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full pl-7 pr-4 py-2 bg-[#1a1a1a] border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-[#39ff14] focus:border-transparent outline-none transition-all text-white placeholder:text-gray-600 font-black uppercase"
            />
          </div>
        </section>

        {/* Facilities Filter */}
        <section className="space-y-4">
          <span className="text-sm font-black text-gray-400 uppercase tracking-widest block">Required Facilities</span>
          <div className="space-y-3">
            {[
              { id: 'hasShower', label: 'Showers', icon: '🚿' },
              { id: 'hasLockers', label: 'Lockers', icon: '🔒' },
              { id: 'hasParking', label: 'Parking', icon: '🚗' }
            ].map((facility) => (
              <label key={facility.id} className="flex items-center group cursor-pointer">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={filters[facility.id as keyof Filters] as boolean}
                    onChange={(e) => setFilters({ ...filters, [facility.id]: e.target.checked })}
                    className="w-5 h-5 border-2 border-gray-700 rounded bg-transparent text-[#39ff14] focus:ring-[#39ff14] cursor-pointer"
                  />
                </div>
                <span className="ml-3 text-gray-400 group-hover:text-[#39ff14] transition-colors font-black uppercase text-xs">
                  {facility.icon} {facility.label}
                </span>
              </label>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-800">
        <button
          onClick={onApply}
          className="w-full py-4 bg-[#39ff14] hover:bg-[#32e612] text-[#1a1a1a] rounded-xl font-russo transition-all shadow-[0_4px_0_rgb(34,197,94)] active:translate-y-[2px] active:shadow-none uppercase tracking-widest"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};
