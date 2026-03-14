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
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[1000] p-4">
        <div className="bg-[#1a1a1a] border-2 border-[#ff1493] rounded-3xl max-w-md w-full p-8 shadow-[0_0_50px_rgba(255,20,147,0.3)] text-center animate-in zoom-in-95 duration-300">
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="text-3xl font-russo mb-2 text-white uppercase tracking-tighter">Claim Received!</h2>
          <p className="text-gray-400 mb-8 font-black uppercase text-xs">We&apos;ll reach out via {method} to verify ownership and unlock your dashboard.</p>
          <button 
            onClick={onClose}
            className="w-full py-4 bg-[#39ff14] hover:bg-[#32e612] text-[#1a1a1a] rounded-xl font-russo transition-all shadow-[0_4px_0_rgb(34,197,94)] active:translate-y-[2px] active:shadow-none uppercase"
          >
            Great, thanks!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[1000] p-4">
      <div className="bg-[#1a1a1a] border-2 border-[#ff1493] rounded-3xl max-w-md w-full p-8 shadow-[0_0_50px_rgba(255,20,147,0.3)] animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
          <h2 className="text-2xl font-russo text-white tracking-tighter uppercase">Claim {place.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-[#ff1493] text-2xl transition-colors">✕</button>
        </div>

        <p className="text-gray-400 mb-8 text-xs italic border-l-4 border-[#39ff14] pl-4 bg-black/20 py-2 rounded-r-lg font-black uppercase tracking-tighter">
          Owner management is entering early access. Provide your details to get verified.
        </p>

        <div className="space-y-6">
          <div className="space-y-3">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Verification Method</span>
            <div className="flex gap-2">
              <button
                onClick={() => setMethod("instagram")}
                className={`flex-1 py-3 rounded-xl border-2 font-black transition-all uppercase text-xs ${
                  method === "instagram" ? "border-[#ff1493] bg-[#ff1493]/10 text-[#ff1493] shadow-sm" : "border-gray-800 text-gray-600 grayscale opacity-60"
                }`}
              >
                📸 Instagram
              </button>
              <button
                onClick={() => setMethod("sms")}
                className={`flex-1 py-3 rounded-xl border-2 font-black transition-all uppercase text-xs ${
                  method === "sms" ? "border-[#ff1493] bg-[#ff1493]/10 text-[#ff1493] shadow-sm" : "border-gray-800 text-gray-600 grayscale opacity-60"
                }`}
              >
                📱 SMS
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              {method === "instagram" ? "Your @Handle" : "Your Phone Number"}
            </label>
            <input
              type="text"
              placeholder={method === "instagram" ? "@gym_name" : "+1 (555) 000-0000"}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-3 bg-[#1a1a1a] border-2 border-gray-800 rounded-xl focus:ring-4 focus:ring-[#39ff14]/10 focus:border-[#39ff14] outline-none transition-all font-black text-white placeholder:text-gray-700 uppercase"
            />
          </div>

          {error && <p className="text-red-500 text-xs font-black bg-red-950 p-3 rounded-lg border-2 border-red-500 animate-in shake duration-300 uppercase">⚠️ {error}</p>}

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !identifier}
            className="w-full py-4 bg-[#39ff14] hover:bg-[#32e612] disabled:opacity-50 text-[#1a1a1a] rounded-2xl font-russo text-lg transition-all shadow-[0_4px_0_rgb(34,197,94)] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2 uppercase"
          >
            {isSubmitting ? "Submitting..." : "Submit Claim ⚡"}
          </button>
        </div>
      </div>
    </div>
  );
};
