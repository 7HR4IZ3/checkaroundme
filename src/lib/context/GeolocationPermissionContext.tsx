"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { LocationPermissionModal } from "@/components/ui/location-permission-modal";

interface GeolocationPermissionContextType {
  showModal: () => void;
  hideModal: () => void;
  isModalOpen: boolean;
}

const GeolocationPermissionContext = createContext<
  GeolocationPermissionContextType | undefined
>(undefined);

const DO_NOT_ASK_AGAIN_KEY = "geolocation_do_not_ask_again";
const MAYBE_LATER_KEY = "geolocation_maybe_later";

export const GeolocationPermissionProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [doNotAskAgain, setDoNotAskAgain] = useState(
    typeof window !== "undefined" &&
      window.localStorage.getItem(DO_NOT_ASK_AGAIN_KEY) === "true"
  );
  const [maybeLater, setMaybeLater] = useState(
    typeof window !== "undefined" &&
      window.sessionStorage.getItem(MAYBE_LATER_KEY) === "true"
  );

  // useEffect(() => {
  //   const storedDoNotAskAgain = localStorage.getItem(DO_NOT_ASK_AGAIN_KEY);
  //   if (storedDoNotAskAgain === "true") {
  //     setDoNotAskAgain(true);
  //   }

  //   console.log(doNotAskAgain, storedDoNotAskAgain);

  //   const storedMaybeLater = sessionStorage.getItem(MAYBE_LATER_KEY);
  //   if (storedMaybeLater === "true") {
  //     setMaybeLater(true);
  //   }
  // }, []);

  const showModal = () => {
    console.log(doNotAskAgain);
    if (!doNotAskAgain && !maybeLater) {
      setIsModalOpen(true);
    }
  };

  const hideModal = () => {
    sessionStorage.setItem(MAYBE_LATER_KEY, "true");
    setMaybeLater(true);
    setIsModalOpen(false);
  };

  const handleConfirm = () => {
    setIsModalOpen(false);
    // Here you might want to add logic to re-request permission
    // or guide the user to settings, depending on desired behavior.
    // For now, we just close the modal.
  };

  const handleDoNotAskAgain = () => {
    setDoNotAskAgain(true);
    localStorage.setItem(DO_NOT_ASK_AGAIN_KEY, "true");
    setIsModalOpen(false);
  };

  return (
    <GeolocationPermissionContext.Provider
      value={{ showModal, hideModal, isModalOpen }}
    >
      {children}
      <LocationPermissionModal
        open={isModalOpen}
        onClose={hideModal}
        onConfirm={handleConfirm}
        onDoNotAskAgain={handleDoNotAskAgain}
      />
    </GeolocationPermissionContext.Provider>
  );
};

export const useGeolocationPermission = () => {
  const context = useContext(GeolocationPermissionContext);
  if (context === undefined) {
    throw new Error(
      "useGeolocationPermission must be used within a GeolocationPermissionProvider"
    );
  }
  return context;
};
