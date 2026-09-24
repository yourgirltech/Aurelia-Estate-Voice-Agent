import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function ErrorState({ message, onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="bg-brand-surface rounded-2xl shadow-card border border-brand-border p-8 sm:p-10 text-center"
    >
      <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-5">
        <AlertTriangle size={26} strokeWidth={1.75} />
      </div>
      <h1 className="font-serif text-xl text-brand mb-2">We hit a snag</h1>
      <p className="text-brand/70 text-sm mb-1">
        Your details haven't been lost — please try again in a moment.
      </p>
      {message && <p className="text-brand/40 text-xs mb-6">{message}</p>}
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-xl bg-brand text-white font-medium hover:bg-brand-dark transition-colors mt-5"
      >
        Try again
      </button>
    </motion.div>
  );
}
