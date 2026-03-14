"use client";

import { useState, useCallback, useEffect } from "react";
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  InfoWindow,
  Pin,
  useMap
} from "@vis.gl/react-google-maps";
import { ClaimGymModal } from "@/components/ClaimGymModal";
import { FilterPanel } from "@/components/FilterPanel";
import { useModals } from "@/lib/modal-context";

interface OpenMat {
  id: string;
  gym_id: string;
  day_of_week: number | null;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  one_off_date: string | null;
  is_cancelled: boolean;
  style: string;
  format: string | null;
  typical_attendance: string | null;
  active: boolean;
}

interface Place {
  place_id: string;
  name: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  has_local_data?: boolean;
  owner_verified?: boolean;
  last_confirmed_at?: string | null;
  report_count?: number;
  open_mats?: OpenMat[];
}

type TimeFilter = "anytime" | "today" | "custom";

const MapHandler = ({ center }: { center: google.maps.LatLngLiteral }) => {
  const map = useMap();
  useEffect(() => {
    if (map && center) {
      map.panTo(center);
    }
  }, [map, center]);
  return null;
};

export default function SearchPage() {
  const { openAddGymModal, setSearchLocation } = useModals();
  const defaultPosition = { lat: 37.7749, lng: -122.4194 };
  const [searchQuery, setSearchQuery] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [mapCenter, setMapCenter] = useState(defaultPosition);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("anytime");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [customStartTime, setCustomStartTime] = useState("09:00");
  const [customEndTime, setCustomEndTime] = useState("17:00");
  const [showClaimGymModal, setShowClaimGymModal] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [currentMapCenter, setCurrentMapCenter] = useState<google.maps.LatLngLiteral | null>(null);
  const [showSearchAreaButton, setShowSearchAreaButton] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [filters, setFilters] = useState({
    distance: 25,
    giStyles: ["gi", "no_gi", "both"],
    maxFee: null as number | null,
    hasShower: false,
    hasLockers: false,
    hasParking: false,
  });

  const handleConfirm = async (gymId: string, openMatId: string) => {
    try {
      const response = await fetch("/api/community/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gymId, openMatId }),
      });
      if (!response.ok) throw new Error("Failed to confirm");
      alert("Thanks for confirming!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReport = async (gymId: string, openMatId: string) => {
    const reason = prompt("What is wrong? (e.g., time wrong, gym closed)");
    if (!reason) return;

    try {
      const response = await fetch("/api/community/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gymId, openMatId, reason }),
      });
      if (!response.ok) throw new Error("Failed to report");
      alert("Report submitted. Thank you!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSearch = useCallback(async (lat?: number, lng?: number) => {
    if (!searchQuery && (!lat || !lng)) return;

    let apiUrl = `/api/search-places?timeFilter=${timeFilter}`;
    if (selectedDate) apiUrl += `&date=${selectedDate}`;
    if (searchQuery) apiUrl += `&textQuery=${encodeURIComponent(searchQuery)}`;
    if (lat && lng) apiUrl += `&lat=${lat}&lng=${lng}`;
    
    if (timeFilter === "custom" && customStartTime && customEndTime) {
      apiUrl += `&customStartTime=${encodeURIComponent(customStartTime)}&customEndTime=${encodeURIComponent(customEndTime)}`;
    }

    apiUrl += `&distance=${filters.distance}`;
    apiUrl += `&giStyles=${filters.giStyles.join(",")}`;
    if (filters.maxFee !== null) apiUrl += `&maxFee=${filters.maxFee}`;
    if (filters.hasShower) apiUrl += `&hasShower=true`;
    if (filters.hasLockers) apiUrl += `&hasLockers=true`;
    if (filters.hasParking) apiUrl += `&hasParking=true`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: Place[] = await response.json();
      setPlaces(data);
      setSelectedPlaceId(null);
    } catch (error) {
      console.error("Error fetching places:", error);
      setPlaces([]);
    }
  }, [searchQuery, timeFilter, customStartTime, customEndTime, filters, selectedDate]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userPos = { lat: latitude, lng: longitude };
          setMapCenter(userPos);
          setSearchLocation(userPos);
          handleSearch(latitude, longitude);
        },
        (error) => {
          console.warn("Geolocation error:", error.message);
          setSearchLocation(defaultPosition);
          handleSearch(defaultPosition.lat, defaultPosition.lng);
        }
      );
    } else {
      setSearchLocation(defaultPosition);
      handleSearch(defaultPosition.lat, defaultPosition.lng);
    }
  }, []);

  useEffect(() => {
    if (places.length > 0 && searchQuery) {
      const firstLoc = places[0].geometry.location;
      setMapCenter(firstLoc);
      setSearchLocation(firstLoc);
    }
  }, [places, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const selectedPlace = places.find(p => p.place_id === selectedPlaceId);

  const handleSearchArea = async () => {
    if (!currentMapCenter) return;
    setMapCenter(currentMapCenter);
    setSearchLocation(currentMapCenter);
    // Clear search query as we are now searching by location
    setSearchQuery("");
    await handleSearch(currentMapCenter.lat, currentMapCenter.lng);
    setShowSearchAreaButton(false);
  };

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
      <div className="flex flex-col h-[calc(100vh-140px)] bg-gray-50 overflow-hidden text-gray-900">
        <header className="bg-[#1a1a1a] border-b border-[#ff1493] z-10 p-4 space-y-4 shadow-xl">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <input
              type="text"
              placeholder="Search city or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow px-4 py-2 rounded-full border-2 border-gray-800 bg-[#222] focus:outline-none focus:ring-2 focus:ring-[#ff1493] focus:border-transparent transition-all shadow-sm text-white placeholder:text-gray-600 font-black uppercase"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={() => handleSearch()}
              className="bg-[#39ff14] hover:bg-[#32e612] text-[#1a1a1a] px-6 py-2 rounded-full font-russo transition-colors shadow-[0_4px_0_rgb(34,197,94)] active:translate-y-[2px] active:shadow-none uppercase"
            >
              SEARCH
            </button>
          </div>

          <div className="flex flex-wrap gap-3 max-w-4xl mx-auto items-center">
            <button
              onClick={() => { 
                setTimeFilter("anytime"); 
                setSelectedDate(null); 
                setShowTimePicker(false); 
              }}
              className={`px-5 py-1.5 rounded-full border-2 text-sm font-black transition-all uppercase ${
                timeFilter === 'anytime' 
                ? 'bg-[#ff1493] border-[#ff1493] text-white shadow-[0_4px_0_rgb(190,24,93)] active:translate-y-[2px] active:shadow-none' 
                : 'bg-[#222] border-gray-800 text-gray-500 hover:text-white'
              }`}
            >
              Anytime
            </button>

            <div className="flex items-center gap-2 bg-[#222] px-3 py-1.5 rounded-full border-2 border-gray-800 shadow-sm">
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Date</span>
              <input 
                type="date" 
                value={selectedDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  const isToday = e.target.value === new Date().toISOString().split('T')[0];
                  if (timeFilter !== 'custom') {
                    setTimeFilter(isToday ? "today" : "custom");
                  }
                }}
                className="bg-transparent text-sm font-black text-[#ff1493] outline-none focus:text-[#39ff14] transition-colors uppercase"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => { 
                  setTimeFilter("today"); 
                  setSelectedDate(new Date().toISOString().split('T')[0]); 
                  setShowTimePicker(false); 
                }}
                className={`px-5 py-1.5 rounded-full border-2 text-sm font-black transition-all uppercase ${
                  timeFilter === 'today' 
                  ? 'bg-[#ff1493] border-[#ff1493] text-white shadow-[0_4px_0_rgb(190,24,93)] active:translate-y-[2px] active:shadow-none' 
                  : 'bg-[#222] border-gray-800 text-gray-500 hover:text-white'
                }`}
              >
                Today
              </button>
              
              <button
                onClick={() => setShowTimePicker(!showTimePicker)}
                className={`px-5 py-1.5 rounded-full border-2 text-sm font-black transition-all flex items-center gap-2 uppercase ${
                  showTimePicker
                  ? 'bg-[#39ff14] border-[#39ff14] text-[#1a1a1a] shadow-[0_4px_0_rgb(34,197,94)] active:translate-y-[2px] active:shadow-none'
                  : timeFilter === 'custom'
                  ? 'bg-[#ff1493] border-[#ff1493] text-white'
                  : 'bg-[#222] border-gray-800 text-gray-500 hover:text-white'
                }`}
              >
                🕒 {timeFilter === 'custom' ? `${customStartTime} - ${customEndTime}` : 'Filter by Time'} {showTimePicker ? '▲' : '▼'}
              </button>
            </div>
          </div>

          {showTimePicker && (
            <div className="flex flex-wrap items-end gap-4 max-w-4xl mx-auto p-5 bg-[#1a1a1a] rounded-2xl border-2 border-[#ff1493] shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-30 relative">
              <div className="flex-grow grid grid-cols-2 gap-4 text-white">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-1">Earliest Start</label>
                  <input
                    type="time"
                    value={customStartTime}
                    onChange={(e) => { setCustomStartTime(e.target.value); setTimeFilter("custom"); }}
                    className="w-full px-4 py-2 rounded-xl bg-[#222] border-2 border-gray-800 focus:ring-4 focus:ring-[#39ff14]/10 focus:border-[#39ff14] outline-none font-black text-white transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block ml-1">Latest End</label>
                  <input
                    type="time"
                    value={customEndTime}
                    onChange={(e) => { setCustomEndTime(e.target.value); setTimeFilter("custom"); }}
                    className="w-full px-4 py-2 rounded-xl bg-[#222] border-2 border-gray-800 focus:ring-4 focus:ring-[#39ff14]/10 focus:border-[#39ff14] outline-none font-black text-white transition-all"
                  />
                </div>
              </div>
              <button 
                onClick={() => { handleSearch(); setShowTimePicker(false); }}
                className="bg-[#39ff14] text-[#1a1a1a] px-8 py-2.5 rounded-xl font-russo shadow-[0_4px_0_rgb(34,197,94)] hover:bg-[#32e612] transition-all active:translate-y-[2px] active:shadow-none text-sm uppercase tracking-wider"
              >
                Apply
              </button>
            </div>
          )}

          <div className="flex gap-2 max-w-4xl mx-auto border-t border-gray-800 pt-4">
            <button
              onClick={() => openAddGymModal()}
              className="flex-grow bg-[#39ff14] hover:bg-[#32e612] text-[#1a1a1a] px-4 py-2 rounded-lg font-russo transition-all shadow-[0_4px_0_rgb(34,197,94)] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2 uppercase"
            >
              <span>+</span> ADD NEW GYM
            </button>
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`flex-grow px-4 py-2 rounded-lg font-russo transition-all shadow-[0_4px_0_rgb(34,197,94)] active:translate-y-[2px] active:shadow-none border-2 flex items-center justify-center gap-2 uppercase ${
                showFilterPanel 
                ? 'bg-[#ff1493] border-[#ff1493] text-white shadow-[0_4px_0_rgb(190,24,93)]' 
                : 'bg-[#222] border-gray-800 text-gray-500 hover:text-white'
              }`}
            >
              <span className="text-lg">⚙️</span> {showFilterPanel ? "HIDE FILTERS" : "FILTERS"}
            </button>
          </div>
        </header>

        <main className="flex-grow flex relative overflow-hidden">
          <aside className={`absolute top-0 left-0 bottom-0 z-30 transition-transform duration-300 transform shadow-2xl ${
            showFilterPanel ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <FilterPanel
              filters={filters}
              setFilters={setFilters}
              onApply={() => { handleSearch(); setShowFilterPanel(false); }}
            />
          </aside>

          <section className="flex-grow h-full relative">
            <Map 
              defaultCenter={defaultPosition} 
              defaultZoom={12} 
              gestureHandling={'greedy'} 
              disableDefaultUI={true}
              mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "bf51a910020faedc"}
              className="h-full w-full"
              onCameraChanged={(ev) => {
                const center = ev.detail.center;
                setCurrentMapCenter(center);
                // Only show if user moved the map and we are past initial load
                if (ev.detail.isUserInput && isLoaded) {
                  setShowSearchAreaButton(true);
                }
              }}
            >
              <MapHandler center={mapCenter} />
              {places.map((place) => (
                <AdvancedMarker
                  key={place.place_id}
                  position={place.geometry.location}
                  onClick={() => setSelectedPlaceId(place.place_id)}
                >
                  <Pin 
                    background={place.has_local_data && place.open_mats && place.open_mats.length > 0 ? '#39ff14' : '#ff1493'}
                    borderColor={'#ffffff'}
                    glyphColor={'#ffffff'}
                  />
                </AdvancedMarker>
              ))}

              {selectedPlace && (
                <InfoWindow
                  position={selectedPlace.geometry.location}
                  onCloseClick={() => setSelectedPlaceId(null)}
                >
                  <div className="p-1 min-w-[220px] text-gray-900">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className="font-black text-gray-900 text-base leading-tight uppercase font-russo">{selectedPlace.name}</h3>
                      {selectedPlace.owner_verified && (
                        <span className="bg-[#39ff14] text-[#1a1a1a] text-[10px] px-1.5 py-0.5 rounded-full font-black flex items-center gap-0.5 whitespace-nowrap">
                          <span className="text-xs">✓</span> Verified
                        </span>
                      )}
                    </div>

                    {selectedPlace.has_local_data && (
                      <div className="mb-3 space-y-1">
                        {((selectedPlace.report_count || 0) >= 3 || (selectedPlace.last_confirmed_at && (new Date().getTime() - new Date(selectedPlace.last_confirmed_at).getTime()) > 1000 * 60 * 60 * 24 * 90)) && (
                          <div className="bg-amber-50 text-amber-700 text-[10px] p-1.5 rounded border border-amber-100 font-black flex items-center gap-1.5">
                            <span>⚠️</span> Likely stale. Check with gym!
                          </div>
                        )}
                        <div className="text-[10px] text-gray-500 font-black uppercase">
                          Last confirmed: {selectedPlace.last_confirmed_at ? new Date(selectedPlace.last_confirmed_at).toLocaleDateString() : 'Never'}
                        </div>
                        {!selectedPlace.owner_verified && (
                          <button 
                            onClick={() => setShowClaimGymModal(true)}
                            className="mt-1 text-[10px] text-[#ff1493] hover:underline block font-black uppercase"
                          >
                            Is this your gym? Claim it.
                          </button>
                        )}
                      </div>
                    )}

                    {selectedPlace.has_local_data && selectedPlace.open_mats && selectedPlace.open_mats.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-xs font-black text-[#ff1493] uppercase tracking-wider">Open Mats Found:</p>
                        <ul className="space-y-3">
                          {selectedPlace.open_mats.map((om, index) => (
                            <li key={index} className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                              <div className="text-sm font-black text-gray-900">
                                {om.day_of_week !== null ? `${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][om.day_of_week]}: ` : ''}
                                {om.start_time} - {om.end_time}
                              </div>
                              <div className="text-xs text-gray-600 font-black capitalize mb-2">
                                {om.style === 'no_gi' ? 'no-gi' : om.style === 'both' ? 'gi and no-gi' : om.style}
                              </div>
                              <div className="flex gap-2 mt-1">
                                <button
                                  onClick={() => handleConfirm(om.gym_id, om.id)}
                                  className="flex-1 bg-white hover:bg-[#39ff14]/10 text-[#1a1a1a] text-[10px] py-1 px-2 border border-gray-300 rounded font-black transition-colors shadow-sm uppercase"
                                >
                                  ✅ Confirm
                                </button>
                                <button
                                  onClick={() => handleReport(om.gym_id, om.id)}
                                  className="flex-1 bg-white hover:bg-[#ff1493]/10 text-[#ff1493] text-[10px] py-1 px-2 border border-gray-300 rounded font-black transition-colors shadow-sm uppercase"
                                >
                                  🚩 Report
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="py-2">
                        <p className="text-sm text-gray-600 font-black italic">
                          {selectedPlace.has_local_data ? "No matches for this time." : "No schedule data yet."}
                        </p>
                        {!selectedPlace.has_local_data && (
                          <button 
                            onClick={() => { 
                              openAddGymModal(selectedPlace);
                              setSelectedPlaceId(null); 
                            }}
                            className="mt-2 text-xs text-[#ff1493] hover:underline font-black uppercase"
                          >
                            + Add open mat info
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </InfoWindow>
              )}
            </Map>
            {showSearchAreaButton && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-2">
                <button
                  onClick={handleSearchArea}
                  className="bg-[#1a1a1a] text-[#39ff14] px-6 py-2.5 rounded-full font-russo shadow-[0_4px_0_rgb(34,197,94)] hover:bg-black transition-all active:translate-y-[2px] active:shadow-none text-sm uppercase tracking-wider border-2 border-[#39ff14] flex items-center gap-2"
                >
                  <span className="text-lg">🔍</span> Search this area
                </button>
              </div>
            )}
          </section>
        </main>

        {showClaimGymModal && selectedPlace && (
          <ClaimGymModal 
            place={selectedPlace} 
            onClose={() => setShowClaimGymModal(false)} 
          />
        )}
      </div>
    </APIProvider>
  );
}
