"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { PasskeySection } from "./PasskeySection";
import { WalletList } from "./WalletList";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Custom wallet connection modal with split view.
 * Left: Passkey (Lazorkit) option
 * Right: Traditional wallet list
 */
export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div 
        className="relative w-full max-w-2xl bg-primary border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-xl font-semibold text-text-primary">
            Connect Wallet
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-white/5"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content - Split View */}
        <div className="flex flex-col md:flex-row min-h-[400px]">
          {/* Left Side - Passkey */}
          <div className="flex-1 p-6 bg-surface border-b md:border-b-0 md:border-r border-white/10">
            <PasskeySection onSuccess={onClose} />
          </div>

          {/* Right Side - Wallet List */}
          <div className="flex-1 p-6 bg-surface">
            <WalletList onSuccess={onClose} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-surface/50">
          <p className="text-sm text-text-muted text-center">
            New to Solana?{" "}
            <span className="text-accent">Try Passkey — no app needed.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
