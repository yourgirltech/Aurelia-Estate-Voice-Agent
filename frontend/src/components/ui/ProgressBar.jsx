import { Check } from "lucide-react";

const STEPS = ["About you", "Your enquiry", "Review & consent"];

export default function ProgressBar({ currentStep }) {
  return (
    <div className="mb-8" aria-label="Form progress">
      <ol className="flex items-center justify-between mb-3">
        {STEPS.map((label, i) => {
          const stepNum = i + 1;
          const isDone = stepNum < currentStep;
          const isActive = stepNum === currentStep;
          return (
            <li key={label} className="flex items-center gap-2 flex-1">
              <span
                aria-current={isActive ? "step" : undefined}
                className={[
                  "flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold shrink-0 transition-colors",
                  isDone
                    ? "bg-brand-gold text-white"
                    : isActive
                    ? "bg-brand text-white"
                    : "bg-brand-border text-brand/50",
                ].join(" ")}
              >
                {isDone ? <Check size={14} strokeWidth={2.5} /> : stepNum}
              </span>
              <span
                className={[
                  "text-xs font-medium hidden sm:inline",
                  isActive ? "text-brand" : "text-brand/50",
                ].join(" ")}
              >
                {label}
              </span>
              {stepNum < STEPS.length && (
                <span className="flex-1 h-px bg-brand-border mx-1" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
      <div className="h-1 rounded-full bg-brand-border overflow-hidden">
        <div
          className="h-full bg-brand-gold transition-all duration-300 ease-out"
          style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
