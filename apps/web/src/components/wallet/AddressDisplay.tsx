"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { getAddressExplorerUrl } from "@/lib/constants";

interface AddressDisplayProps {
  address: string;
  /** Show full address or truncated */
  truncate?: boolean;
}

/**
 * Displays a wallet address with copy-to-clipboard functionality.
 */
export function AddressDisplay({ address, truncate = true }: AddressDisplayProps) {
  const [copied, setCopied] = useState(false);

  const displayAddress = truncate
    ? `${address.slice(0, 6)}...${address.slice(-6)}`
    : address;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-elevated rounded-xl border border-white/10">
      <span className="font-mono text-sm text-text-primary flex-1">
        {displayAddress}
      </span>
      
      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="p-1.5 text-text-muted hover:text-accent transition-colors rounded-lg hover:bg-white/5"
        title={copied ? "Copied!" : "Copy address"}
      >
        {copied ? (
          <Check size={16} className="text-pnl-green" />
        ) : (
          <Copy size={16} />
        )}
      </button>

      {/* Explorer link */}
      <a
        href={getAddressExplorerUrl(address)}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 text-text-muted hover:text-accent transition-colors rounded-lg hover:bg-white/5"
        title="View on Explorer"
      >
        <ExternalLink size={16} />
      </a>
    </div>
  );
}
