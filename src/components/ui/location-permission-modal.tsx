import React from "react";
import { Button } from "./button";

interface LocationPermissionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onDoNotAskAgain: () => void;
}

export const LocationPermissionModal: React.FC<
  LocationPermissionModalProps
> = ({ open, onClose, onConfirm, onDoNotAskAgain }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl flex flex-col items-center">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 6l12 12M6 18L18 6" />
          </svg>
        </button>

        {/* Icon */}
        <div className="mb-6 mt-2 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 border-4 border-white shadow-md">
            {/* Location SVG (using a simple placeholder for now) */}
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </span>
        </div>

        {/* Title */}
        <h2 className="mb-2 text-2xl font-semibold text-center text-[#2B3674]">
          Location Permission Required
        </h2>
        {/* Subtitle */}
        <p className="mb-8 text-center">
          To provide you with the best experience, we need access to your
          location.
          <br />
          Please grant location permission when prompted by your browser.
        </p>

        {/* Buttons */}
        <div className="flex w-full gap-4">
          <Button
            variant="outline"
            className="flex-1 bg-gray-100 text-gray-600 hover:bg-gray-200"
            onClick={onClose}
            type="button"
          >
            Maybe later
          </Button>
          <Button
            variant="default"
            className="flex-1 bg-[#2B3674] hover:bg-[#1e2550]"
            onClick={onConfirm}
            type="button"
          >
            Grant Permission
          </Button>
        </div>
        {/* Do not ask again option */}
        <button
          className="mt-4 text-sm text-gray-500 hover:text-gray-700"
          onClick={onDoNotAskAgain}
        >
          Do not ask again
        </button>
      </div>
    </div>
  );
};
