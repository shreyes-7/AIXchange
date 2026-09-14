export default function SkeletonCard({ className = '', lines = 3 }) {
  return (
    <div
      className={`p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 animate-pulse flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-800" />
          <div className="w-20 h-5 rounded-full bg-slate-800" />
        </div>
        <div className="h-5 w-3/4 rounded-md bg-slate-800 mb-3" />
        <div className="space-y-2 mb-6">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className="h-3 rounded-md bg-slate-800/60"
              style={{ width: i === lines - 1 ? '60%' : '100%' }}
            />
          ))}
        </div>
      </div>
      <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
        <div className="h-4 w-16 rounded bg-slate-800" />
        <div className="h-7 w-24 rounded-lg bg-slate-800" />
      </div>
    </div>
  );
}
