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
import { AddGymModal } from "@/components/AddGymModal";
import { ClaimGymModal } from "@/components/ClaimGymModal";
import { FilterPanel } from "@/components/FilterPanel";

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

export default function Home() {
  const defaultPosition = { lat: 37.7749, lng: -122.4194 };
  const [searchQuery, setSearchQuery] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [mapCenter, setMapCenter] = useState(defaultPosition);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("anytime");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [customStartTime, setCustomStartTime] = useState("09:00");
  const [customEndTime, setCustomEndTime] = useState("17:00");
  const [showAddGymModal, setShowAddGymModal] = useState(false);
  const [gymToAutoAdd, setGymToAutoAdd] = useState<Place | null>(null);
  const [showClaimGymModal, setShowClaimGymModal] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  
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
          handleSearch(latitude, longitude);
        },
        (error) => {
          console.warn("Geolocation error:", error.message);
          handleSearch(defaultPosition.lat, defaultPosition.lng);
        }
      );
    } else {
      handleSearch(defaultPosition.lat, defaultPosition.lng);
    }
  }, []);

  useEffect(() => {
    if (places.length > 0 && searchQuery) {
      setMapCenter(places[0].geometry.location);
    }
  }, [places, searchQuery]);

  const selectedPlace = places.find(p => p.place_id === selectedPlaceId);

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
      <div className="flex flex-col h-screen bg-gray-50 overflow-hidden text-gray-900">
        <header className="bg-white shadow-md z-10 p-4 space-y-4">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <input
              type="text"
              placeholder="Search city or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm text-gray-900 placeholder:text-gray-500 font-semibold"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={() => handleSearch()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold transition-colors shadow-sm active:scale-95"
            >
              Search
            </button>
          </div>

          <div className="flex flex-wrap gap-3 max-w-4xl mx-auto items-center">
            <button
              onClick={() => { 
                setTimeFilter("anytime"); 
                setSelectedDate(null); 
                setShowTimePicker(false); 
              }}
              className={`px-5 py-1.5 rounded-full border text-sm font-bold transition-all ${
                timeFilter === 'anytime' 
                ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' 
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Anytime
            </button>

            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</span>
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
                className="bg-transparent text-sm font-bold text-gray-900 outline-none focus:text-blue-600 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => { 
                  setTimeFilter("today"); 
                  setSelectedDate(new Date().toISOString().split('T')[0]); 
                  setShowTimePicker(false); 
                }}
                className={`px-5 py-1.5 rounded-full border text-sm font-bold transition-all ${
                  timeFilter === 'today' 
                  ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' 
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Today
              </button>
              
              <button
                onClick={() => setShowTimePicker(!showTimePicker)}
                className={`px-5 py-1.5 rounded-full border text-sm font-bold transition-all flex items-center gap-2 ${
                  showTimePicker
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                  : timeFilter === 'custom'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                🕒 {timeFilter === 'custom' ? `${customStartTime} - ${customEndTime}` : 'Filter by Time'} {showTimePicker ? '▲' : '▼'}
              </button>
            </div>
          </div>

          {showTimePicker && (
            <div className="flex flex-wrap items-end gap-4 max-w-4xl mx-auto p-5 bg-white rounded-2xl border border-gray-200 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 z-30 relative">
              <div className="flex-grow grid grid-cols-2 gap-4 text-gray-900">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block ml-1">Earliest Start</label>
                  <input
                    type="time"
                    value={customStartTime}
                    onChange={(e) => { setCustomStartTime(e.target.value); setTimeFilter("custom"); }}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-gray-900 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block ml-1">Latest End</label>
                  <input
                    type="time"
                    value={customEndTime}
                    onChange={(e) => { setCustomEndTime(e.target.value); setTimeFilter("custom"); }}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-gray-900 transition-all"
                  />
                </div>
              </div>
              <button 
                onClick={() => { handleSearch(); setShowTimePicker(false); }}
                className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-black shadow-lg hover:bg-blue-700 transition-all active:scale-95 text-sm uppercase tracking-wider"
              >
                Apply
              </button>
            </div>
          )}

          <div className="flex gap-2 max-w-4xl mx-auto border-t pt-4">
            <button
              onClick={() => setShowAddGymModal(true)}
              className="flex-grow bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>+</span> Add New Gym
            </button>
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`flex-grow px-4 py-2 rounded-lg font-bold transition-all shadow-sm active:scale-[0.98] border flex items-center justify-center gap-2 ${
                showFilterPanel 
                ? 'bg-gray-100 border-gray-400 text-gray-800' 
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">⚙️</span> {showFilterPanel ? "Hide Filters" : "Filters"}
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

          <section className="flex-grow h-full z-0">
            <Map 
              defaultCenter={defaultPosition} 
              defaultZoom={12} 
              gestureHandling={'greedy'} 
              disableDefaultUI={true}
              mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "bf51a910020faedc"}
              className="h-full w-full"
            >
              <MapHandler center={mapCenter} />
              {places.map((place) => (
                <AdvancedMarker
                  key={place.place_id}
                  position={place.geometry.location}
                  onClick={() => setSelectedPlaceId(place.place_id)}
                >
                  <Pin 
                    background={place.has_local_data && place.open_mats && place.open_mats.length > 0 ? '#16a34a' : '#2563eb'}
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
                      <h3 className="font-bold text-gray-900 text-base leading-tight">{selectedPlace.name}</h3>
                      {selectedPlace.owner_verified && (
                        <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 whitespace-nowrap">
                          <span className="text-xs">✓</span> Verified
                        </span>
                      )}
                    </div>

                    {selectedPlace.has_local_data && (
                      <div className="mb-3 space-y-1">
                        {((selectedPlace.report_count || 0) >= 3 || (selectedPlace.last_confirmed_at && (new Date().getTime() - new Date(selectedPlace.last_confirmed_at).getTime()) > 1000 * 60 * 60 * 24 * 90)) && (
                          <div className="bg-amber-50 text-amber-700 text-[10px] p-1.5 rounded border border-amber-100 font-medium flex items-center gap-1.5">
                            <span>⚠️</span> Likely stale. Check with gym!
                          </div>
                        )}
                        <div className="text-[10px] text-gray-500 font-bold">
                          Last confirmed: {selectedPlace.last_confirmed_at ? new Date(selectedPlace.last_confirmed_at).toLocaleDateString() : 'Never'}
                        </div>
                        {!selectedPlace.owner_verified && (
                          <button 
                            onClick={() => setShowClaimGymModal(true)}
                            className="mt-1 text-[10px] text-blue-600 hover:underline block font-bold"
                          >
                            Is this your gym? Claim it.
                          </button>
                        )}
                      </div>
                    )}

                    {selectedPlace.has_local_data && selectedPlace.open_mats && selectedPlace.open_mats.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-xs font-black text-blue-600 uppercase tracking-wider">Open Mats Found:</p>
                        <ul className="space-y-3">
                          {selectedPlace.open_mats.map((om, index) => (
                            <li key={index} className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                              <div className="text-sm font-bold text-gray-900">
                                {om.day_of_week !== null ? `${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][om.day_of_week]}: ` : ''}
                                {om.start_time} - {om.end_time}
                              </div>
                              <div className="text-xs text-gray-600 font-bold capitalize mb-2">{om.style}</div>
                              <div className="flex gap-2 mt-1">
                                <button
                                  onClick={() => handleConfirm(om.gym_id, om.id)}
                                  className="flex-1 bg-white hover:bg-green-50 text-green-700 text-[10px] py-1 px-2 border border-green-200 rounded font-bold transition-colors shadow-sm"
                                >
                                  ✅ Confirm
                                </button>
                                <button
                                  onClick={() => handleReport(om.gym_id, om.id)}
                                  className="flex-1 bg-white hover:bg-red-50 text-red-700 text-[10px] py-1 px-2 border border-red-200 rounded font-bold transition-colors shadow-sm"
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
                        <p className="text-sm text-gray-600 font-bold italic">
                          {selectedPlace.has_local_data ? "No matches for this time." : "No schedule data yet."}
                        </p>
                        {!selectedPlace.has_local_data && (
                          <button 
                            onClick={() => { 
                              setGymToAutoAdd(selectedPlace);
                              setShowAddGymModal(true); 
                              setSelectedPlaceId(null); 
                            }}
                            className="mt-2 text-xs text-blue-600 hover:underline font-black"
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
          </section>
        </main>

        {showAddGymModal && (
          <AddGymModal 
            onClose={() => { setShowAddGymModal(false); setGymToAutoAdd(null); }} 
            onGymAdded={() => handleSearch()} 
            initialPlace={gymToAutoAdd as any}
          />
        )}

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
