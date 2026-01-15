"use client";

import { X } from "lucide-react";

interface ConfirmTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  amount: number;
  recipient: string;
  isGasless: boolean;
  loading?: boolean;
}

/**
 * Confirmation dialog before sending a transfer.
 * Shows amount, recipient, and gas cost (gasless for Lazorkit).
 */
export function ConfirmTransferModal({
  isOpen,
  onClose,
  onConfirm,
  amount,
  recipient,
  isGasless,
  loading,
}: ConfirmTransferModalProps) {
  if (!isOpen) return null;

  const truncatedRecipient = `${recipient.slice(0, 6)}...${recipient.slice(-6)}`;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm bg-primary border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-text-primary">
            Confirm Transfer
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-white/5 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-text-muted">You are about to send:</p>

          {/* Amount */}
          <div className="text-center py-3">
            <span className="text-3xl font-bold text-text-primary">
              {amount.toFixed(2)}
            </span>
            <span className="text-lg text-text-muted ml-2">USDC</span>
          </div>

          {/* Recipient */}
          <div className="space-y-1">
            <p className="text-xs text-text-muted">To:</p>
            <p className="font-mono text-sm text-text-primary bg-elevated px-3 py-2 rounded-lg">
              {truncatedRecipient}
            </p>
          </div>

          {/* Gas info */}
          <div className="flex items-center justify-center gap-2 py-2">
            {isGasless ? (
              <>
                <span className="text-pnl-green text-sm font-medium">✨ Gasless</span>
                <span className="text-xs text-text-muted">— You pay $0 in fees</span>
              </>
            ) : (
              <>
                <span className="text-text-secondary text-sm">Gas:</span>
                <span className="text-xs text-text-muted">~0.00005 SOL</span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-5 pt-0">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-10 px-4 bg-surface border border-white/10 text-text-primary rounded-xl font-medium hover:bg-elevated transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 h-10 px-4 bg-white text-primary rounded-xl font-medium hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Sending...
              </>
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
