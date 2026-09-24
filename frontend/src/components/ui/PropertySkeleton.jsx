export default function PropertySkeleton() {
  return (
    <div className="rounded-xl border border-brand-border p-4 animate-pulse">
      <div className="h-4 w-3/4 bg-brand-border rounded mb-3" />
      <div className="h-3 w-1/2 bg-brand-border rounded mb-4" />
      <div className="flex items-center justify-between">
        <div className="h-4 w-16 bg-brand-border rounded" />
        <div className="h-3 w-8 bg-brand-border rounded" />
      </div>
    </div>
  );
}
