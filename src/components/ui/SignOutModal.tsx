import React from "react";
import { Button } from "./button";

interface SignOutModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const SignOutModal: React.FC<SignOutModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
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
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M6 18L18 6" />
          </svg>
        </button>

        {/* Icon */}
        <div className="mb-6 mt-2 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 border-4 border-white shadow-md">
            {/* Logout SVG */}
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 16l-4-4 4-4" />
              <path d="M5 12h12" />
              <path d="M17 16v1a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
            </svg>
          </span>
        </div>

        {/* Title */}
        <h2 className="mb-2 text-2xl font-semibold text-center text-[#2B3674]">Sign out?</h2>
        {/* Subtitle */}
        <p className="mb-8 text-center text-gray-500">
          Oh no! We are sad to see you leave.<br />
          Are you sure you want to sign out?
        </p>

        {/* Buttons */}
        <div className="flex w-full gap-4">
          <Button
            variant="outline"
            className="flex-1 bg-gray-100 text-gray-600 hover:bg-gray-200"
            onClick={onClose}
            type="button"
          >
            Go back
          </Button>
          <Button
            variant="default"
            className="flex-1 bg-[#2B3674] hover:bg-[#1e2550]"
            onClick={onConfirm}
            type="button"
          >
            Yes, confirm
          </Button>
        </div>
      </div>
    </div>
  );
};