import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-full min-h-[360px] flex items-center justify-center p-6">
          <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-rose-500/30 text-center shadow-xl shadow-rose-950/20">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Component Execution Fault</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              An unexpected render fault occurred in this module. Local state was preserved.
            </p>
            {this.state.error && (
              <div className="mb-6 p-3 rounded-lg bg-slate-950 border border-slate-800 text-left font-mono text-[11px] text-rose-300 max-h-24 overflow-y-auto">
                {this.state.error.message || 'Unknown runtime error'}
              </div>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold transition-colors shadow-md shadow-cyan-500/20"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Go to Home</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
