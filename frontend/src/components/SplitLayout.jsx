import { Clock, Languages, ShieldCheck } from "lucide-react";
import { COMPANY } from "../config/company.js";
import TalkToPrecious from "./TalkToPrecious.jsx";

const ICONS = { Clock, Languages, ShieldCheck };

export default function SplitLayout({ children, preciousCall }) {
  return (
    <div className="lg:grid lg:grid-cols-2 lg:min-h-screen">
      <VisualPanel preciousCall={preciousCall} />
      <div className="flex justify-center px-4 py-8 sm:py-12 lg:py-16 lg:overflow-y-auto">
        <div className="w-full max-w-xl">{children}</div>
      </div>
    </div>
  );
}

function VisualPanel({ preciousCall }) {
  return (
    <div
      className="relative h-56 sm:h-64 lg:h-auto lg:sticky lg:top-0 lg:min-h-screen flex flex-col justify-between overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(7,21,39,0.55) 0%, rgba(7,21,39,0.85) 100%), url(${COMPANY.heroImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="p-6 sm:p-8 lg:p-12 flex items-center gap-3">
        <img src={COMPANY.logoUrl} alt="" className="w-8 h-8" />
        <span className="text-white font-semibold text-lg tracking-wide">{COMPANY.name}</span>
      </div>

      <div className="px-6 sm:px-8 lg:px-12 pb-6 lg:pb-12">
        <h1 className="hidden lg:block font-serif text-white text-4xl xl:text-[2.75rem] leading-tight mb-8 max-w-sm">
          {COMPANY.tagline}
        </h1>
        <p className="lg:hidden font-serif text-white text-xl leading-snug mb-1 max-w-xs">
          {COMPANY.tagline}
        </p>

        <ul className="hidden lg:flex flex-col gap-3">
          {COMPANY.trustPoints.map((point) => {
            const Icon = ICONS[point.icon];
            return (
              <li key={point.label} className="flex items-center gap-3 text-white/90 text-sm">
                {Icon && (
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10">
                    <Icon size={16} strokeWidth={1.75} />
                  </span>
                )}
                {point.label}
              </li>
            );
          })}
        </ul>

        <TalkToPrecious preciousCall={preciousCall} variant="panel" className="hidden lg:block mt-8 max-w-sm" />
      </div>
    </div>
  );
}
