import { Info, CheckCircle2, AlertTriangle, XCircle, ShieldAlert, X } from 'lucide-react';

export default function AlertBanner({
  type = 'info',
  title,
  message,
  onClose,
  className = '',
}) {
  const styles = {
    info: {
      container: 'bg-sky-950/40 border-sky-800/50 text-sky-200',
      icon: <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />,
    },
    success: {
      container: 'bg-emerald-950/40 border-emerald-800/50 text-emerald-200',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />,
    },
    warning: {
      container: 'bg-amber-950/40 border-amber-800/50 text-amber-200',
      icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />,
    },
    error: {
      container: 'bg-rose-950/40 border-rose-800/50 text-rose-200',
      icon: <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />,
    },
    security: {
      container: 'bg-purple-950/40 border-purple-800/50 text-purple-200',
      icon: <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />,
    },
  }[type] || {
    container: 'bg-slate-900 border-slate-800 text-slate-300',
    icon: <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />,
  };

  return (
    <div
      role="alert"
      className={`w-full p-3.5 rounded-xl border text-xs flex items-start justify-between gap-3 ${styles.container} ${className}`}
    >
      <div className="flex items-start gap-2.5">
        {styles.icon}
        <div>
          {title && <span className="font-semibold block mb-0.5">{title}</span>}
          <span className="opacity-90 leading-relaxed">{message}</span>
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Dismiss alert"
          className="p-1 rounded-md hover:bg-white/10 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
