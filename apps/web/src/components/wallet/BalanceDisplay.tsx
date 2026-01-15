"use client";

import { RefreshCw } from "lucide-react";

interface BalanceDisplayProps {
  sol: number;
  usdc: number;
  loading?: boolean;
  onRefresh?: () => void;
}

/**
 * Displays SOL and USDC balances in a compact format.
 */
export function BalanceDisplay({ sol, usdc, loading, onRefresh }: BalanceDisplayProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* SOL Balance */}
        <div className="flex items-center gap-1.5">
          <span className="text-text-muted">◎</span>
          <span className="font-mono text-sm text-text-primary">
            {loading ? "..." : sol.toFixed(4)}
          </span>
          <span className="text-xs text-text-muted">SOL</span>
        </div>

        <span className="text-text-muted">|</span>

        {/* USDC Balance */}
        <div className="flex items-center gap-1.5">
          <span className="text-text-muted">💵</span>
          <span className="font-mono text-sm text-text-primary">
            {loading ? "..." : usdc.toFixed(2)}
          </span>
          <span className="text-xs text-text-muted">USDC</span>
        </div>
      </div>

      {/* Refresh button */}
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-1.5 text-text-muted hover:text-accent transition-colors rounded-lg hover:bg-white/5 disabled:opacity-50"
          title="Refresh balances"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      )}
    </div>
  );
}
