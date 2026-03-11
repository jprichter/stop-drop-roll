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
    <div className="w-80 h-full bg-white flex flex-col p-6 shadow-xl border-r border-gray-200">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold text-gray-900">Filters</h3>
        <button onClick={onApply} className="text-blue-600 font-semibold text-sm hover:underline">Done</button>
      </div>

      <div className="flex-grow space-y-8 overflow-y-auto pr-2 no-scrollbar">
        {/* Distance Filter */}
        <section className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Distance</span>
            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{filters.distance} miles</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={filters.distance}
            onChange={(e) => setFilters({ ...filters, distance: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </section>

        {/* Gi Style Filter */}
        <section className="space-y-3">
          <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider block">Style</span>
          <div className="flex flex-wrap gap-2">
            {["gi", "no_gi", "both"].map((style) => (
              <button
                key={style}
                onClick={() => handleStyleChange(style)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  filters.giStyles.includes(style)
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                    : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                {style === 'no_gi' ? 'No-Gi' : style.charAt(0).toUpperCase() + style.slice(1)}
              </button>
            ))}
          </div>
        </section>

        {/* Max Fee Filter */}
        <section className="space-y-3">
          <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider block">
            Max Drop-in Fee ($)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="number"
              placeholder="Any price"
              value={filters.maxFee || ""}
              onChange={(e) => setFilters({ ...filters, maxFee: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full pl-7 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-500 font-bold"
            />
          </div>
        </section>

        {/* Facilities Filter */}
        <section className="space-y-4">
          <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider block">Required Facilities</span>
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
                    className="w-5 h-5 border-gray-300 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
                <span className="ml-3 text-gray-600 group-hover:text-gray-900 transition-colors">
                  {facility.icon} {facility.label}
                </span>
              </label>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100">
        <button
          onClick={onApply}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-[0.98] elevation-hover"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};
