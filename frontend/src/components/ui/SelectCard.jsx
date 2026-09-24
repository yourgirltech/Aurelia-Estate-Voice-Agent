// A selectable card/chip used for enquiry type, property type, bedrooms,
// timeline and payment method. Plain <button> so it's keyboard accessible
// with no extra wiring.
export default function SelectCard({ label, icon: Icon, selected, onClick, compact }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        "flex items-center gap-2.5 rounded-xl border text-left transition-all min-h-[44px]",
        compact ? "px-3.5 py-2.5 text-sm" : "px-4 py-3.5 text-sm",
        selected
          ? "border-brand-gold bg-brand-gold/10 text-brand shadow-soft"
          : "border-brand-border bg-brand-surface text-brand/80 hover:border-brand-gold/50 hover:bg-brand-gold/5",
      ].join(" ")}
    >
      {Icon && (
        <Icon
          size={18}
          strokeWidth={1.75}
          className={selected ? "text-brand-gold" : "text-brand/40"}
        />
      )}
      <span className="font-medium">{label}</span>
    </button>
  );
}
