import { BedDouble, MapPin, HelpCircle } from "lucide-react";
import { formatPrice } from "../../lib/format.js";

export function PropertyCard({ property, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        "text-left rounded-xl border p-4 transition-all min-h-[44px]",
        selected
          ? "border-brand-gold bg-brand-gold/10 shadow-soft"
          : "border-brand-border bg-brand-surface hover:border-brand-gold/50 hover:bg-brand-gold/5",
      ].join(" ")}
    >
      <p className="font-semibold text-brand text-sm mb-1">{property.name}</p>
      <p className="flex items-center gap-1 text-xs text-brand/60 mb-2">
        <MapPin size={13} strokeWidth={1.75} />
        {property.location}
      </p>
      <div className="flex items-center justify-between">
        {property.price ? (
          <span className="text-sm font-semibold text-brand-gold">
            {formatPrice(property.price, property.currency)}
          </span>
        ) : (
          <span />
        )}
        {property.bedrooms != null && (
          <span className="flex items-center gap-1 text-xs text-brand/60">
            <BedDouble size={13} strokeWidth={1.75} />
            {property.bedrooms}
          </span>
        )}
      </div>
    </button>
  );
}

export function NotSurePropertyCard({ selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        "text-left rounded-xl border border-dashed p-4 flex flex-col justify-center items-start gap-2 transition-all min-h-[44px]",
        selected
          ? "border-brand-gold bg-brand-gold/10 shadow-soft"
          : "border-brand-border bg-brand-surface hover:border-brand-gold/50 hover:bg-brand-gold/5",
      ].join(" ")}
    >
      <HelpCircle size={18} strokeWidth={1.75} className={selected ? "text-brand-gold" : "text-brand/40"} />
      <span className="font-medium text-sm text-brand">I'm still exploring — show me options</span>
    </button>
  );
}
