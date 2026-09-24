// Small bar visualiser driven by the Vapi SDK's volume-level (0–1).
// Purely decorative, so it's hidden from assistive tech.
const BAR_WEIGHTS = [0.5, 0.9, 1, 0.75, 0.55];

export default function AdaVisualizer({ volumeLevel = 0, tone = "light" }) {
  const barClass = tone === "light" ? "bg-white/80" : "bg-brand-gold";

  return (
    <div className="flex items-end gap-1 h-7" aria-hidden="true">
      {BAR_WEIGHTS.map((weight, i) => {
        const heightPct = Math.max(18, Math.min(100, volumeLevel * 100 * weight + 12));
        return (
          <span
            key={i}
            className={`w-1.5 rounded-full transition-all duration-150 ease-out ${barClass}`}
            style={{ height: `${heightPct}%` }}
          />
        );
      })}
    </div>
  );
}
