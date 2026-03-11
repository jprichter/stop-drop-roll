"use client";

import { useState } from "react";

interface Place {
  place_id: string;
  name: string;
  id?: string; // Local DB ID if available
}

interface ClaimGymModalProps {
  place: Place;
  onClose: () => void;
}

export const ClaimGymModal = ({ place, onClose }: ClaimGymModalProps) => {
  const [method, setMethod] = useState<"instagram" | "sms">("instagram");
  const [identifier, setIdentifier] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSubmittingSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!identifier) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/claim-gym", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googlePlaceId: place.place_id,
          gymName: place.name,
          method,
          externalIdentifier: identifier,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit claim");
      }

      setIsSubmittingSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl text-center animate-in zoom-in-95 duration-300">
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="text-2xl font-black mb-2 text-gray-900">Claim Received!</h2>
          <p className="text-gray-600 mb-8">We'll reach out via {method} to verify ownership and unlock your dashboard.</p>
          <button 
            onClick={onClose}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95"
          >
            Great, thanks!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Claim {place.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 text-2xl">✕</button>
        </div>

        <p className="text-gray-600 mb-8 text-sm italic border-l-4 border-blue-500 pl-4 bg-blue-50 py-2 rounded-r-lg font-medium">
          Owner management is entering early access. Provide your details to get verified.
        </p>

        <div className="space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Verification Method</span>
            <div className="flex gap-2">
              <button
                onClick={() => setMethod("instagram")}
                className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${
                  method === "instagram" ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm" : "border-gray-100 text-gray-400 grayscale opacity-60"
                }`}
              >
                📸 Instagram
              </button>
              <button
                onClick={() => setMethod("sms")}
                className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${
                  method === "sms" ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm" : "border-gray-100 text-gray-400 grayscale opacity-60"
                }`}
              >
                📱 SMS
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              {method === "instagram" ? "Your @Handle" : "Your Phone Number"}
            </label>
            <input
              type="text"
              placeholder={method === "instagram" ? "@gym_name" : "+1 (555) 000-0000"}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-gray-900 placeholder:text-gray-500"
            />
          </div>

          {error && <p className="text-red-600 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100 animate-in shake duration-300">⚠️ {error}</p>}

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !identifier}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl font-black text-lg transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
          >
            {isSubmitting ? "Submitting..." : "Submit Claim ⚡"}
          </button>
        </div>
      </div>
    </div>
  );
};
