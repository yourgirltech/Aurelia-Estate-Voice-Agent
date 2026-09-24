// Label-above-input wrapper shared by every text/select field in the form.
export default function Field({ label, required, error, children, htmlFor, hint }) {
  return (
    <div className="mb-5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-brand/80 mb-1.5">
        {label} {required && <span className="text-brand-gold">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-brand/50">{hint}</p>}
      {error && (
        <p className="mt-1.5 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputClass =
  "w-full min-h-[48px] rounded-xl border border-brand-border bg-brand-surface px-3.5 py-2.5 text-[0.9375rem] text-brand placeholder:text-brand/40 transition-colors focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold-light";
