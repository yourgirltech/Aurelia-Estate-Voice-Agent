// "Talk to Precious" card: a live in-browser voice call (Vapi Web SDK) plus
// a fallback phone number. Rendered with variant="panel" on the dark hero
// image (desktop) and variant="mobile" as a plain card above the form.
import { Mic, MicOff, PhoneOff, Loader2, AlertCircle, Phone as PhoneIcon, RotateCcw } from "lucide-react";
import PreciousVisualizer from "./PreciousVisualizer.jsx";
import { isPreciousCallAvailable } from "../lib/usePreciousCall.js";

const PHONE_DISPLAY = import.meta.env.VITE_PHONE_DISPLAY;
const PHONE_E164 = import.meta.env.VITE_PHONE_E164;
const isPhoneAvailable = Boolean(PHONE_DISPLAY && PHONE_E164);

export default function TalkToPrecious({ preciousCall, variant = "mobile", className = "" }) {
  if (!isPreciousCallAvailable && !isPhoneAvailable) return null;

  const isPanel = variant === "panel";
  const textClass = isPanel ? "text-white" : "text-brand";
  const mutedTextClass = isPanel ? "text-white/60" : "text-brand/60";
  const containerClass = isPanel
    ? "bg-white/10 border border-white/15 backdrop-blur-sm rounded-2xl p-5"
    : "bg-brand-surface border border-brand-border rounded-2xl p-5 shadow-soft";

  return (
    <div className={`${containerClass} ${className}`}>
      <p className={`text-sm font-medium mb-3 ${textClass}`}>Prefer to talk now?</p>

      {isPreciousCallAvailable && (
        <CallControls
          preciousCall={preciousCall}
          isPanel={isPanel}
          textClass={textClass}
          mutedTextClass={mutedTextClass}
        />
      )}

      {isPreciousCallAvailable && isPhoneAvailable && (
        <div className={`my-4 h-px ${isPanel ? "bg-white/15" : "bg-brand-border"}`} />
      )}

      {isPhoneAvailable && (
        <PhoneSection textClass={textClass} mutedTextClass={mutedTextClass} />
      )}
    </div>
  );
}

function PhoneSection({ textClass, mutedTextClass }) {
  return (
    <div>
      <a
        href={`tel:${PHONE_E164}`}
        className={`inline-flex items-center gap-2 text-sm font-medium ${textClass} hover:underline`}
      >
        <PhoneIcon size={15} strokeWidth={1.75} className="text-brand-gold" />
        Or call us: {PHONE_DISPLAY}
      </a>
      <p className={`text-xs mt-1 ${mutedTextClass}`}>International call rates may apply.</p>
    </div>
  );
}

function CallControls({ preciousCall, isPanel, textClass, mutedTextClass }) {
  const { status, isPreciousSpeaking, volumeLevel, isMuted, elapsedSeconds, error, start, stop, toggleMute } =
    preciousCall;

  const buttonBase =
    "inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-xl font-medium transition-colors w-full";
  const primaryButton = isPanel
    ? `${buttonBase} bg-brand-gold text-brand hover:bg-brand-gold-light`
    : `${buttonBase} bg-brand text-white hover:bg-brand-dark`;
  const secondaryButton = isPanel
    ? "border-white/25 text-white hover:bg-white/10"
    : "border-brand-border text-brand hover:bg-brand-bg";

  return (
    <div aria-live="polite">
      {status === "idle" && (
        <>
          <button type="button" onClick={start} className={primaryButton}>
            <Mic size={18} strokeWidth={1.75} />
            Talk to Precious
          </button>
          <p className={`text-xs mt-2 ${mutedTextClass}`}>Live AI assistant · any language · free</p>
          <p className={`text-xs mt-1 ${mutedTextClass}`}>
            By starting a call you agree that the call may be recorded for quality and
            record-keeping.
          </p>
        </>
      )}

      {status === "connecting" && (
        <button type="button" disabled className={`${primaryButton} opacity-70 cursor-not-allowed`}>
          <Loader2 size={18} className="animate-spin" strokeWidth={2} />
          Connecting you to Precious…
        </button>
      )}

      {status === "live" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <PreciousVisualizer volumeLevel={volumeLevel} tone={isPanel ? "light" : "dark"} />
            <span className={`text-xs font-mono ${mutedTextClass}`}>{formatTimer(elapsedSeconds)}</span>
          </div>
          <p className={`text-xs mb-3 ${mutedTextClass}`}>
            {isPreciousSpeaking ? "Precious is speaking…" : "Listening…"}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={toggleMute}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 min-h-[44px] rounded-xl text-sm font-medium border transition-colors ${secondaryButton}`}
            >
              {isMuted ? <MicOff size={16} strokeWidth={1.75} /> : <Mic size={16} strokeWidth={1.75} />}
              {isMuted ? "Unmute" : "Mute"}
            </button>
            <button
              type="button"
              onClick={stop}
              className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-[44px] rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              <PhoneOff size={16} strokeWidth={1.75} />
              End call
            </button>
          </div>
        </div>
      )}

      {status === "ended" && (
        <div>
          <p className={`text-sm mb-3 ${textClass}`}>
            Thanks for speaking with Precious. A consultant will follow up by email.
          </p>
          <button type="button" onClick={start} className={primaryButton}>
            <Mic size={18} strokeWidth={1.75} />
            Talk again
          </button>
        </div>
      )}

      {status === "error" && (
        <div>
          <p className={`flex items-start gap-2 text-sm mb-3 ${textClass}`}>
            <AlertCircle size={16} strokeWidth={1.75} className="text-red-400 shrink-0 mt-0.5" />
            {errorMessage(error)}
          </p>
          <button type="button" onClick={start} className={primaryButton}>
            <RotateCcw size={16} strokeWidth={1.75} />
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

function errorMessage(error) {
  switch (error?.kind) {
    case "mic-denied":
      return "Microphone access was denied. Allow microphone access for this site in your browser's settings, then try again.";
    case "no-mic":
      return "We couldn't find a microphone. Please connect one and try again.";
    default:
      return "We couldn't connect you to Precious. Please try again.";
  }
}

function formatTimer(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
