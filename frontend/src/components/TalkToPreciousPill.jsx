// Small floating "Talk to Precious" button that stays visible while
// scrolling on mobile. Desktop already has the persistent card in the
// visual panel, so this only renders below the lg breakpoint.
import { Mic, Loader2, PhoneOff } from "lucide-react";
import { isPreciousCallAvailable } from "../lib/usePreciousCall.js";

export default function TalkToPreciousPill({ preciousCall }) {
  if (!isPreciousCallAvailable) return null;

  const { status, start, stop } = preciousCall;
  // A live call already has full controls in the card above — the pill
  // only needs to offer starting a call, or ending one in a pinch.
  const isLive = status === "live";
  const isConnecting = status === "connecting";

  return (
    <button
      type="button"
      onClick={isLive ? stop : start}
      disabled={isConnecting}
      aria-live="polite"
      className={`lg:hidden fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 min-h-[44px] px-5 rounded-full font-medium shadow-card transition-colors ${
        isLive
          ? "bg-red-600 text-white hover:bg-red-700"
          : "bg-brand-gold text-brand hover:bg-brand-gold-light disabled:opacity-70"
      }`}
    >
      {isConnecting && <Loader2 size={18} className="animate-spin" strokeWidth={2} />}
      {isLive && <PhoneOff size={18} strokeWidth={1.75} />}
      {!isConnecting && !isLive && <Mic size={18} strokeWidth={1.75} />}
      {isLive ? "End call" : isConnecting ? "Connecting…" : "Talk to Precious"}
    </button>
  );
}
