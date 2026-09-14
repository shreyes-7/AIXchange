import { Link } from 'react-router-dom';
import { Database } from 'lucide-react';

export default function EmptyState({
  title = 'No Assets Found',
  description = 'No records match your active query or network parameters.',
  icon: Icon = Database,
  actionLabel,
  onAction,
  actionLink,
}) {
  return (
    <div className="w-full py-16 px-4 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
        <Icon className="w-8 h-8 text-cyan-400/70" />
      </div>
      <h3 className="text-base font-bold text-white mb-2">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLink && actionLabel && (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {actionLabel}
        </Link>
      )}
      {onAction && actionLabel && !actionLink && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
