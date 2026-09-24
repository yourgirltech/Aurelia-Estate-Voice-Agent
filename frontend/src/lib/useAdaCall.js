// Manages a single live browser call with Ada (the Vapi inbound assistant)
// using the Vapi Web SDK. Only the Vapi PUBLIC key is ever used here — it's
// designed to be exposed in frontend code. The private key lives only in
// the Edge Function's secrets and is never referenced from this file.
import { useCallback, useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import { buildSalutation } from "./salutations.js";
import { LANGUAGES } from "../config/languages.js";

const PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;
const ASSISTANT_ID = import.meta.env.VITE_VAPI_INBOUND_ASSISTANT_ID;

// Exported so components can hide the "Talk to Ada" button entirely when
// these aren't configured, instead of rendering something that will fail.
export const isAdaCallAvailable = Boolean(PUBLIC_KEY && ASSISTANT_ID);

// call status: "idle" | "connecting" | "live" | "ended" | "error"
export function useAdaCall(aboutYou) {
  const vapiRef = useRef(null);
  const timerRef = useRef(null);
  // Read via a ref so `start()` always uses the latest known-visitor data
  // without needing to be re-created (and re-subscribed) on every change.
  const aboutYouRef = useRef(aboutYou);
  aboutYouRef.current = aboutYou;

  const [status, setStatus] = useState("idle");
  const [isAdaSpeaking, setIsAdaSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState(null); // { kind, message }

  useEffect(() => {
    if (!isAdaCallAvailable) return;

    const vapi = new Vapi(PUBLIC_KEY);
    vapiRef.current = vapi;

    const handleCallStart = () => {
      setStatus("live");
      setError(null);
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    };
    const handleCallEnd = () => {
      clearInterval(timerRef.current);
      setIsAdaSpeaking(false);
      setVolumeLevel(0);
      // Don't overwrite an error state that already explains what happened.
      setStatus((prev) => (prev === "error" ? prev : "ended"));
    };
    const handleSpeechStart = () => setIsAdaSpeaking(true);
    const handleSpeechEnd = () => setIsAdaSpeaking(false);
    const handleVolumeLevel = (level) => setVolumeLevel(level);
    const handleError = (err) => {
      console.error("Ada call error:", err);
      clearInterval(timerRef.current);
      setStatus("error");
      setError(classifyError(err));
    };

    vapi.on("call-start", handleCallStart);
    vapi.on("call-end", handleCallEnd);
    vapi.on("speech-start", handleSpeechStart);
    vapi.on("speech-end", handleSpeechEnd);
    vapi.on("volume-level", handleVolumeLevel);
    vapi.on("error", handleError);

    return () => {
      vapi.off("call-start", handleCallStart);
      vapi.off("call-end", handleCallEnd);
      vapi.off("speech-start", handleSpeechStart);
      vapi.off("speech-end", handleSpeechEnd);
      vapi.off("volume-level", handleVolumeLevel);
      vapi.off("error", handleError);
      clearInterval(timerRef.current);
      // If the component using this hook unmounts mid-call, hang up rather
      // than leaving an orphaned call running with no UI attached to it.
      try {
        vapi.stop();
      } catch {
        // no active call — nothing to stop
      }
    };
  }, []);

  const start = useCallback(async () => {
    if (!vapiRef.current) return;
    setStatus("connecting");
    setError(null);
    try {
      const known = aboutYouRef.current;
      const assistantOverrides = known
        ? {
            variableValues: {
              is_known: "yes",
              salutation: buildSalutation(
                known.language,
                known.titleCode,
                known.firstName,
                known.surname
              ),
              first_name: known.firstName,
              surname: known.surname,
              email: known.email,
              language: LANGUAGES.find((l) => l.code === known.language)?.label || known.language,
            },
          }
        : undefined;

      await vapiRef.current.start(ASSISTANT_ID, assistantOverrides);
    } catch (err) {
      setStatus("error");
      setError(classifyError(err));
    }
  }, []);

  const stop = useCallback(() => {
    vapiRef.current?.stop();
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prevMuted) => {
      const next = !prevMuted;
      vapiRef.current?.setMuted(next);
      return next;
    });
  }, []);

  return { status, isAdaSpeaking, volumeLevel, isMuted, elapsedSeconds, error, start, stop, toggleMute };
}

function classifyError(err) {
  const name = err?.name || "";
  const message = String(err?.message || err?.errorMsg || err?.error || err || "");

  if (name === "NotAllowedError" || /permission/i.test(message)) {
    return {
      kind: "mic-denied",
      message: "Microphone access was denied.",
    };
  }
  if (name === "NotFoundError" || /no microphone|device not found/i.test(message)) {
    return {
      kind: "no-mic",
      message: "We couldn't find a microphone.",
    };
  }
  return {
    kind: "unknown",
    message: message || "Something went wrong starting the call.",
  };
}
