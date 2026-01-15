"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useWallet as useLazorkitWallet } from "@lazorkit/wallet";
import { Fingerprint } from "lucide-react";

interface PasskeySectionProps {
  onSuccess: () => void;
}

/**
 * Left side of the modal - Passkey (Lazorkit) option.
 * Uses Lazorkit's native useWallet hook.
 */
export function PasskeySection({ onSuccess }: PasskeySectionProps) {
  // Use Lazorkit's native wallet hook
  const { connect, isConnecting, isConnected } = useLazorkitWallet();
  const [error, setError] = useState<string | null>(null);
  const [localConnecting, setLocalConnecting] = useState(false);
  
  // Track previous isConnecting state to detect when popup closes
  const prevIsConnecting = useRef(isConnecting);

  // Watch for isConnecting to change from true to false (popup closed)
  useEffect(() => {
    // If we were connecting but now we're not, and we're not connected
    if (prevIsConnecting.current && !isConnecting && !isConnected) {
      console.log("Lazorkit popup closed without connecting");
      setLocalConnecting(false);
    }
    
    // If we became connected, close the modal
    if (isConnected && localConnecting) {
      console.log("Lazorkit connected!");
      setLocalConnecting(false);
      onSuccess();
    }
    
    prevIsConnecting.current = isConnecting;
  }, [isConnecting, isConnected, localConnecting, onSuccess]);

  const handleConnect = useCallback(async () => {
    setError(null);
    setLocalConnecting(true);

    try {
      // Use Lazorkit's connect (feeMode is the only option)
      await connect();
      // If we get here, connection succeeded
      setLocalConnecting(false);
      onSuccess();
    } catch (err: any) {
      console.error("Passkey connection error:", err);
      setLocalConnecting(false);
      // Only show error if it's not a user cancellation
      if (!err?.message?.toLowerCase().includes("cancel") &&
          !err?.message?.toLowerCase().includes("abort") &&
          !err?.message?.toLowerCase().includes("closed") &&
          !err?.message?.toLowerCase().includes("reject")) {
        setError("Connection failed. Try again.");
      }
    }
  }, [connect, onSuccess]);

  // If already connected via Lazorkit, close the modal
  useEffect(() => {
    if (isConnected) {
      onSuccess();
    }
  }, [isConnected, onSuccess]);

  // Determine if we're in a connecting state
  const showConnecting = localConnecting || isConnecting;

  const benefits = [
    "No app to install",
    "No seed phrase to save",
    "Ready in 2 seconds",
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Icon */}
      <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-accent/10 text-accent mb-4">
        <Fingerprint size={28} />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-text-primary mb-1">Passkey</h3>
      <p className="text-xs text-accent mb-3">Powered by Lazorkit</p>

      {/* Description */}
      <p className="text-sm text-text-secondary mb-4">
        Just use your fingerprint to create a wallet.
      </p>

      {/* Benefits */}
      <ul className="space-y-2 mb-6">
        {benefits.map((benefit, index) => (
          <li
            key={index}
            className="flex items-center gap-2 text-sm text-text-secondary"
          >
            <span className="text-pnl-green">✓</span>
            {benefit}
          </li>
        ))}
      </ul>

      {/* Lazorkit branding */}
      <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-white/5 rounded-lg">
        <div className="w-5 h-5 rounded bg-accent/20 flex items-center justify-center">
          <Fingerprint size={12} className="text-accent" />
        </div>
        <span className="text-xs text-text-muted">Lazorkit Smart Wallet</span>
      </div>

      {/* Connect Button */}
      <button
        onClick={handleConnect}
        disabled={showConnecting}
        className="
          mt-auto
          w-full
          py-3 px-4
          bg-accent
          hover:bg-accent/90
          text-primary font-semibold
          rounded-xl
          transition-colors
          disabled:opacity-50 disabled:cursor-wait
        "
      >
        {showConnecting ? "Waiting for passkey..." : "Connect with Passkey"}
      </button>

      {/* Cancel hint when connecting */}
      {showConnecting && (
        <button
          onClick={() => setLocalConnecting(false)}
          className="mt-2 text-xs text-text-muted hover:text-text-secondary text-center transition-colors"
        >
          Cancel
        </button>
      )}

      {/* Error */}
      {error && (
        <p className="mt-3 text-xs text-pnl-red text-center">{error}</p>
      )}
    </div>
  );
}
