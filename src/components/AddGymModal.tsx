"use client";

import { useState, useCallback } from "react";

interface PlaceSearchResult {
  place_id: string;
  name: string;
  address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface OpenMatSchedule {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  style: string;
  is_recurring: boolean;
  one_off_date?: string;
}

interface AddGymModalProps {
  onClose: () => void;
  onGymAdded?: () => void;
  initialPlace?: PlaceSearchResult | null;
  searchLocation?: google.maps.LatLngLiteral | null;
}

export const AddGymModal = ({ onClose, onGymAdded, initialPlace, searchLocation }: AddGymModalProps) => {
  const [step, setStep] = useState(initialPlace ? 2 : 1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceSearchResult | null>(initialPlace || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 2 States
  const [dropInFeeCents, setDropInFeeCents] = useState<number | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [waiverType, setWaiverType] = useState<string>("none");
  const [hasShower, setHasShower] = useState(false);
  const [lockerType, setLockerType] = useState<string>("none");
  const [parkingType, setParkingType] = useState<string>("none");
  const [advanceNoticeRequired, setAdvanceNoticeRequired] = useState(false);
  const [typicalAttendance, setTypicalAttendance] = useState<string>("<10");
  const [preferredContact, setPreferredContact] = useState<string>("instagram");

  // Step 3 States
  const [openMatSchedules, setOpenMatSchedules] = useState<OpenMatSchedule[]>([]);
  const [currentOpenMat, setCurrentOpenMat] = useState<OpenMatSchedule>({
    id: String(Date.now()),
    day_of_week: 0,
    start_time: "09:00",
    end_time: "10:00",
    style: "gi",
    is_recurring: true,
  });

  const handleSearchPlaces = useCallback(async () => {
    if (!searchQuery) return;
    setIsLoading(true);
    setError(null);
    try {
      let apiUrl = `/api/search-places?textQuery=${encodeURIComponent(searchQuery)}`;
      if (searchLocation) {
        apiUrl += `&lat=${searchLocation.lat}&lng=${searchLocation.lng}`;
      }
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: PlaceSearchResult[] = await response.json();
      setSearchResults(data);
    } catch (err: any) {
      setError(`Failed to search places: ${err.message}`);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  const addOpenMat = () => {
    setOpenMatSchedules((prev) => [...prev, { ...currentOpenMat, id: String(Date.now()) }]);
    setCurrentOpenMat({
      id: String(Date.now()),
      day_of_week: 0,
      start_time: "09:00",
      end_time: "10:00",
      style: "gi",
      is_recurring: true,
    });
  };

  const removeOpenMat = (id: string) => {
    setOpenMatSchedules((prev) => prev.filter((om) => om.id !== id));
  };

  const handleSubmitGym = async () => {
    if (!selectedPlace) return;
    setIsSubmitting(true);
    setError(null);

    const gymData = {
      selectedPlace,
      gymDetails: {
        dropInFeeCents,
        paymentMethods,
        waiverType,
        hasShower,
        lockerType,
        parkingType,
        advanceNoticeRequired,
        typicalAttendance,
        preferredContact,
      },
      openMatSchedules,
    };

    try {
      const response = await fetch("/api/add-gym", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gymData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add gym");
      }

      alert("Gym added successfully!");
      if (onGymAdded) onGymAdded();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-2">
        <h3 className="text-xl font-russo text-[#39ff14] uppercase">Step 1: Find your gym</h3>
        <p className="text-sm text-gray-400 uppercase font-black">Search for your gym on Google Maps to link the location.</p>
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Gym name or address"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow px-4 py-3 bg-[#1a1a1a] border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-[#39ff14] focus:border-transparent outline-none transition-all text-white placeholder:text-gray-600 font-black uppercase"
          onKeyDown={(e) => e.key === 'Enter' && handleSearchPlaces()}
        />
        <button
          onClick={handleSearchPlaces}
          disabled={isLoading}
          className="bg-[#39ff14] hover:bg-[#32e612] text-[#1a1a1a] px-6 py-2 rounded-lg font-russo transition-colors disabled:opacity-50 shadow-[0_4px_0_rgb(34,197,94)] active:translate-y-[2px] active:shadow-none uppercase"
        >
          {isLoading ? "..." : "Search"}
        </button>
      </div>

      <div className="max-h-[300px] overflow-y-auto border-2 border-gray-700 rounded-xl divide-y divide-gray-800 shadow-inner bg-black/20">
        {searchResults.length === 0 && !isLoading && (
          <div className="p-8 text-center text-gray-600 font-black uppercase italic">No results yet. Try searching!</div>
        )}
        {searchResults.map((place) => (
          <button
            key={place.place_id}
            onClick={() => setSelectedPlace(place)}
            className={`w-full text-left p-4 hover:bg-[#ff1493]/10 transition-colors group flex flex-col gap-1 ${
              selectedPlace?.place_id === place.place_id ? 'bg-[#ff1493]/20 border-l-4 border-[#ff1493]' : ''
            }`}
          >
            <span className={`font-black uppercase tracking-wider ${selectedPlace?.place_id === place.place_id ? 'text-[#ff1493]' : 'text-white group-hover:text-[#ff1493]'}`}>{place.name}</span>
            <span className="text-[10px] text-gray-500 font-black uppercase">{place.address}</span>
          </button>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
        <button onClick={onClose} className="px-6 py-2 text-gray-400 font-black hover:text-white uppercase transition-colors">Cancel</button>
        <button 
          onClick={() => setStep(2)} 
          disabled={!selectedPlace} 
          className="bg-[#ff1493] hover:bg-[#e01282] disabled:opacity-50 text-white px-8 py-2 rounded-lg font-russo transition-all shadow-[0_4px_0_rgb(190,24,93)] active:translate-y-[2px] active:shadow-none uppercase"
        >
          Next
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-2">
        <h3 className="text-xl font-russo text-[#39ff14] uppercase">Step 2: Facilities & Logistics</h3>
        <p className="text-sm text-gray-400 uppercase font-black">Helping practitioners choose the right spot for them.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Facilities Section */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-[#ff1493] uppercase tracking-widest border-b border-[#ff1493]/30 pb-2">Facilities</h4>
          
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" checked={hasShower} onChange={(e) => setHasShower(e.target.checked)} className="w-5 h-5 bg-transparent border-2 border-gray-700 rounded text-[#39ff14] focus:ring-[#39ff14]" />
            <span className="text-xs text-gray-400 group-hover:text-white font-black uppercase transition-colors">🚿 Has Shower</span>
          </label>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase">Locker Type</label>
            <select value={lockerType} onChange={(e) => setLockerType(e.target.value)} className="w-full p-2 bg-[#1a1a1a] border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-[#39ff14] outline-none text-xs font-black text-white uppercase">
              <option value="none">None</option>
              <option value="free">Free</option>
              <option value="bring_lock">Bring Lock</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase">Parking Type</label>
            <select value={parkingType} onChange={(e) => setParkingType(e.target.value)} className="w-full p-2 bg-[#1a1a1a] border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-[#39ff14] outline-none text-xs font-black text-white uppercase">
              <option value="none">None</option>
              <option value="street">Street</option>
              <option value="lot">Lot</option>
              <option value="garage">Garage</option>
            </select>
          </div>
        </div>

        {/* Drop-in Logistics Section */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-[#ff1493] uppercase tracking-widest border-b border-[#ff1493]/30 pb-2">Drop-in Details</h4>
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase">Drop-in Fee ($)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#39ff14] font-black">$</span>
              <input 
                type="number" 
                placeholder="0.00"
                value={dropInFeeCents ? (dropInFeeCents / 100) : ''} 
                onChange={(e) => setDropInFeeCents(e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null)} 
                className="w-full pl-7 pr-4 py-2 bg-[#1a1a1a] border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-[#39ff14] outline-none text-sm font-black text-white placeholder:text-gray-600 uppercase"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase">Payment Methods</label>
            <div className="flex flex-wrap gap-2">
              {['Cash', 'Venmo', 'Paypal', 'Credit Card'].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => {
                    setPaymentMethods(prev => 
                      prev.includes(method) 
                        ? prev.filter(m => m !== method) 
                        : [...prev, method]
                    )
                  }}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all border-2 ${
                    paymentMethods.includes(method)
                      ? 'bg-[#39ff14] border-[#39ff14] text-[#1a1a1a]'
                      : 'bg-transparent border-gray-700 text-gray-500 hover:border-[#39ff14] hover:text-white'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase">Waiver Type</label>
            <select value={waiverType} onChange={(e) => setWaiverType(e.target.value)} className="w-full p-2 bg-[#1a1a1a] border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-[#39ff14] outline-none text-xs font-black text-white uppercase">
              <option value="none">None Required</option>
              <option value="online">Online</option>
              <option value="in_person">In Person</option>
            </select>
          </div>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" checked={advanceNoticeRequired} onChange={(e) => setAdvanceNoticeRequired(e.target.checked)} className="w-5 h-5 bg-transparent border-2 border-gray-700 rounded text-[#39ff14] focus:ring-[#39ff14]" />
            <span className="text-xs text-gray-400 group-hover:text-white font-black uppercase transition-colors">📅 Advance Notice Required</span>
          </label>
        </div>
      </div>

      <div className="flex justify-between gap-3 pt-6 border-t border-gray-800">
        <button onClick={() => setStep(1)} className="px-6 py-2 text-gray-400 font-black hover:text-white uppercase transition-colors">Back</button>
        <button onClick={() => setStep(3)} className="bg-[#ff1493] hover:bg-[#e01282] text-white px-8 py-2 rounded-lg font-russo transition-all shadow-[0_4px_0_rgb(190,24,93)] active:translate-y-[2px] active:shadow-none uppercase">Next</button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-2">
        <h3 className="text-xl font-russo text-[#39ff14] uppercase">Step 3: Open Mat Schedule</h3>
        <p className="text-sm text-gray-400 uppercase font-black">Add the specific slots for your open mats.</p>
      </div>

      <div className="bg-black/20 p-4 rounded-xl border-2 border-gray-700 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-[#ff1493] uppercase">Day</label>
            <select
              value={currentOpenMat.day_of_week}
              onChange={(e) => setCurrentOpenMat({ ...currentOpenMat, day_of_week: parseInt(e.target.value) })}
              className="w-full p-2 bg-[#1a1a1a] border-2 border-gray-700 rounded-lg text-xs font-black text-white uppercase focus:ring-2 focus:ring-[#39ff14] outline-none"
            >
              {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, index) => (
                <option key={index} value={index}>{day}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-[#ff1493] uppercase">Style</label>
            <select
              value={currentOpenMat.style}
              onChange={(e) => setCurrentOpenMat({ ...currentOpenMat, style: e.target.value })}
              className="w-full p-2 bg-[#1a1a1a] border-2 border-gray-700 rounded-lg text-xs font-black text-white uppercase focus:ring-2 focus:ring-[#39ff14] outline-none"
            >
              <option value="gi">Gi</option>
              <option value="no_gi">no-gi</option>
              <option value="both">gi and no-gi</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-[#ff1493] uppercase">Start</label>
            <input
              type="time"
              value={currentOpenMat.start_time}
              onChange={(e) => setCurrentOpenMat({ ...currentOpenMat, start_time: e.target.value })}
              className="w-full p-2 bg-[#1a1a1a] border-2 border-gray-700 rounded-lg text-xs font-black text-white focus:ring-2 focus:ring-[#39ff14] outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-[#ff1493] uppercase">End</label>
            <input
              type="time"
              value={currentOpenMat.end_time}
              onChange={(e) => setCurrentOpenMat({ ...currentOpenMat, end_time: e.target.value })}
              className="w-full p-2 bg-[#1a1a1a] border-2 border-gray-700 rounded-lg text-xs font-black text-white focus:ring-2 focus:ring-[#39ff14] outline-none"
            />
          </div>
        </div>
        
        <button
          onClick={addOpenMat}
          className="w-full bg-transparent hover:bg-[#39ff14] text-[#39ff14] hover:text-[#1a1a1a] py-2 rounded-lg font-russo border-2 border-[#39ff14] transition-all active:translate-y-[2px] uppercase tracking-wider"
        >
          + Add This Slot
        </button>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">Added Slots ({openMatSchedules.length})</h4>
        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 no-scrollbar">
          {openMatSchedules.length === 0 ? (
            <div className="text-center py-8 text-gray-600 font-black uppercase italic text-xs bg-black/10 rounded-xl border-2 border-dashed border-gray-800">
              No slots added yet.
            </div>
          ) : (
            openMatSchedules.map((om) => (
              <div key={om.id} className="flex justify-between items-center bg-[#1a1a1a] p-3 rounded-lg border-2 border-gray-800 group hover:border-[#ff1493] transition-colors">
                <div className="flex flex-col">
                  <span className="font-black text-white uppercase text-xs">
                    {om.is_recurring ?
                      ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][om.day_of_week] :
                      om.one_off_date
                    }
                  </span>
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-tighter">
                    {om.start_time} - {om.end_time} • {om.style === 'no_gi' ? 'no-gi' : om.style === 'both' ? 'gi and no-gi' : om.style}
                  </span>
                </div>
                <button 
                  onClick={() => removeOpenMat(om.id)} 
                  className="p-2 text-gray-600 hover:text-[#ff1493] hover:bg-[#ff1493]/10 rounded-full transition-all"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex justify-between gap-3 pt-6 border-t border-gray-800 mt-4">
        <button onClick={() => setStep(2)} disabled={isSubmitting} className="px-6 py-2 text-gray-400 font-black hover:text-white uppercase transition-colors">Back</button>
        <button
          onClick={handleSubmitGym}
          disabled={isSubmitting || (openMatSchedules.length === 0)}
          className="bg-[#39ff14] hover:bg-[#32e612] disabled:opacity-50 text-[#1a1a1a] px-10 py-2 rounded-lg font-russo transition-all shadow-[0_4px_0_rgb(34,197,94)] active:translate-y-[2px] active:shadow-none flex items-center gap-2 uppercase"
        >
          {isSubmitting ? "Submitting..." : "🚀 Submit"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[1000] p-4">
      <div className="bg-[#1a1a1a] border-2 border-[#ff1493] rounded-3xl max-w-xl w-full max-h-[90vh] overflow-hidden shadow-[0_0_50px_rgba(255,20,147,0.3)] flex flex-col scale-100 animate-in zoom-in-95 duration-300">
        {/* Progress Bar */}
        <div className="h-2 w-full bg-gray-900 flex">
          <div className={`h-full bg-[#39ff14] shadow-[0_0_10px_rgba(57,255,20,0.5)] transition-all duration-500 ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'}`} />
        </div>
        
        <div className="p-8 overflow-y-auto no-scrollbar">
          <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
            <h2 className="text-3xl font-russo text-white uppercase tracking-tighter">
              {step === 1 ? "Add New Gym" : step === 2 ? "Gym Details" : "Schedule"}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-[#ff1493] text-2xl font-light transition-colors">✕</button>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-950 border-2 border-red-500 text-red-400 rounded-xl text-xs font-black uppercase animate-in slide-in-from-top-2">
              ⚠️ {error}
            </div>
          )}

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
      </div>
    </div>
  );
};
