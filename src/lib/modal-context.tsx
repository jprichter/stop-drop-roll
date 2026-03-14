"use client";

import React, { createContext, useContext, useState } from "react";
import { AddGymModal } from "@/components/AddGymModal";

interface ModalContextType {
  openAddGymModal: (place?: any) => void;
  closeAddGymModal: () => void;
  setSearchLocation: (loc: google.maps.LatLngLiteral | null) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isAddGymOpen, setIsAddGymOpen] = useState(false);
  const [initialPlace, setInitialPlace] = useState<any>(null);
  const [searchLocation, setSearchLocation] = useState<google.maps.LatLngLiteral | null>(null);

  const openAddGymModal = (place?: any) => {
    setInitialPlace(place || null);
    setIsAddGymOpen(true);
  };
  const closeAddGymModal = () => {
    setIsAddGymOpen(false);
    setInitialPlace(null);
  };

  return (
    <ModalContext.Provider value={{ openAddGymModal, closeAddGymModal, setSearchLocation }}>
      {children}
      {isAddGymOpen && (
        <AddGymModal 
          onClose={closeAddGymModal} 
          initialPlace={initialPlace}
          searchLocation={searchLocation}
        />
      )}
    </ModalContext.Provider>
  );
}

export function useModals() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModals must be used within a ModalProvider");
  }
  return context;
}
