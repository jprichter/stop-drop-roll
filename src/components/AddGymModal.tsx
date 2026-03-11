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
  initialPlace?: PlaceSearchResult | null; // New prop for pre-selected gym
}

export const AddGymModal = ({ onClose, onGymAdded, initialPlace }: AddGymModalProps) => {
  const [step, setStep] = useState(initialPlace ? 2 : 1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceSearchResult | null>(initialPlace || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 2 States
  const [dropInFeeCents, setDropInFeeCents] = useState<number | null>(null);
  const [cashOnly, setCashOnly] = useState(false);
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
      const response = await fetch(`/api/search-places?textQuery=${encodeURIComponent(searchQuery)}`);
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
        cashOnly,
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
        <h3 className="text-lg font-bold text-gray-900">Step 1: Find your gym</h3>
        <p className="text-sm text-gray-500">Search for your gym on Google Maps to link the location.</p>
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Gym name or address"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm text-gray-900 placeholder:text-gray-500 font-semibold"
          onKeyDown={(e) => e.key === 'Enter' && handleSearchPlaces()}
        />
        <button
          onClick={handleSearchPlaces}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 shadow-sm"
        >
          {isLoading ? "..." : "Search"}
        </button>
      </div>

      <div className="max-h-[300px] overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100 shadow-inner bg-gray-50">
        {searchResults.length === 0 && !isLoading && (
          <div className="p-8 text-center text-gray-400 italic">No results yet. Try searching!</div>
        )}
        {searchResults.map((place) => (
          <button
            key={place.place_id}
            onClick={() => setSelectedPlace(place)}
            className={`w-full text-left p-4 hover:bg-blue-50 transition-colors group flex flex-col gap-1 ${
              selectedPlace?.place_id === place.place_id ? 'bg-blue-50 ring-2 ring-inset ring-blue-500' : ''
            }`}
          >
            <span className="font-bold text-gray-900 group-hover:text-blue-700">{place.name}</span>
            <span className="text-xs text-gray-500">{place.address}</span>
          </button>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button onClick={onClose} className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
        <button 
          onClick={() => setStep(2)} 
          disabled={!selectedPlace} 
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-2 rounded-lg font-bold transition-all shadow-md active:scale-95"
        >
          Next
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-gray-900">Step 2: Facilities & Logistics</h3>
        <p className="text-sm text-gray-500">Helping practitioners choose the right spot for them.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Facilities Section */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b pb-2">Facilities</h4>
          
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" checked={hasShower} onChange={(e) => setHasShower(e.target.checked)} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium transition-colors">🚿 Has Shower</span>
          </label>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500">Locker Type</label>
            <select value={lockerType} onChange={(e) => setLockerType(e.target.value)} className="w-full p-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium">
              <option value="none">None</option>
              <option value="free">Free</option>
              <option value="bring_lock">Bring Lock</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500">Parking Type</label>
            <select value={parkingType} onChange={(e) => setParkingType(e.target.value)} className="w-full p-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium">
              <option value="none">None</option>
              <option value="street">Street</option>
              <option value="lot">Lot</option>
              <option value="garage">Garage</option>
            </select>
          </div>
        </div>

        {/* Drop-in Logistics Section */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b pb-2">Drop-in Details</h4>
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500">Drop-in Fee ($)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input 
                type="number" 
                placeholder="0.00"
                value={dropInFeeCents ? (dropInFeeCents / 100) : ''} 
                onChange={(e) => setDropInFeeCents(e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null)} 
                className="w-full pl-7 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-gray-900 placeholder:text-gray-500"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" checked={cashOnly} onChange={(e) => setCashOnly(e.target.checked)} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium transition-colors">💵 Cash Only</span>
          </label>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500">Waiver Type</label>
            <select value={waiverType} onChange={(e) => setWaiverType(e.target.value)} className="w-full p-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium">
              <option value="none">None Required</option>
              <option value="online">Online</option>
              <option value="in_person">In Person</option>
            </select>
          </div>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" checked={advanceNoticeRequired} onChange={(e) => setAdvanceNoticeRequired(e.target.checked)} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium transition-colors">📅 Advance Notice Required</span>
          </label>
        </div>
      </div>

      <div className="flex justify-between gap-3 pt-6 border-t">
        <button onClick={() => setStep(1)} className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">Back</button>
        <button onClick={() => setStep(3)} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-bold transition-all shadow-md active:scale-95">Next</button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-gray-900">Step 3: Open Mat Schedule</h3>
        <p className="text-sm text-gray-500">Add the specific slots for your open mats.</p>
      </div>

      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-blue-600 uppercase">Day</label>
            <select
              value={currentOpenMat.day_of_week}
              onChange={(e) => setCurrentOpenMat({ ...currentOpenMat, day_of_week: parseInt(e.target.value) })}
              className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, index) => (
                <option key={index} value={index}>{day}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-blue-600 uppercase">Style</label>
            <select
              value={currentOpenMat.style}
              onChange={(e) => setCurrentOpenMat({ ...currentOpenMat, style: e.target.value })}
              className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="gi">Gi</option>
              <option value="no_gi">No-Gi</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-blue-600 uppercase">Start</label>
            <input
              type="time"
              value={currentOpenMat.start_time}
              onChange={(e) => setCurrentOpenMat({ ...currentOpenMat, start_time: e.target.value })}
              className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-blue-600 uppercase">End</label>
            <input
              type="time"
              value={currentOpenMat.end_time}
              onChange={(e) => setCurrentOpenMat({ ...currentOpenMat, end_time: e.target.value })}
              className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
        
        <button
          onClick={addOpenMat}
          className="w-full bg-white hover:bg-blue-600 hover:text-white text-blue-600 py-2 rounded-lg font-bold border-2 border-blue-600 transition-all active:scale-[0.98]"
        >
          + Add This Slot
        </button>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Added Slots ({openMatSchedules.length})</h4>
        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 no-scrollbar">
          {openMatSchedules.length === 0 ? (
            <div className="text-center py-8 text-gray-400 italic text-sm bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              No slots added yet.
            </div>
          ) : (
            openMatSchedules.map((om) => (
              <div key={om.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200 group hover:border-blue-300 transition-colors">
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900 text-sm">
                    {om.is_recurring ?
                      ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][om.day_of_week] :
                      om.one_off_date
                    }
                  </span>
                  <span className="text-xs text-gray-500">{om.start_time} - {om.end_time} • <span className="capitalize">{om.style}</span></span>
                </div>
                <button 
                  onClick={() => removeOpenMat(om.id)} 
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex justify-between gap-3 pt-6 border-t mt-4">
        <button onClick={() => setStep(2)} disabled={isSubmitting} className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">Back</button>
        <button
          onClick={handleSubmitGym}
          disabled={isSubmitting || (openMatSchedules.length === 0)}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-10 py-2 rounded-lg font-bold transition-all shadow-lg active:scale-95 flex items-center gap-2"
        >
          {isSubmitting ? "Submitting..." : "🚀 Submit Gym"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 p-md-0">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col scale-100 animate-in zoom-in-95 duration-300">
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-gray-100 flex">
          <div className={`h-full bg-blue-600 transition-all duration-500 ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'}`} />
        </div>
        
        <div className="p-8 overflow-y-auto no-scrollbar">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Add New Gym</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-900 text-2xl font-light">✕</button>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-medium animate-in slide-in-from-top-2">
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
