import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught component runtime exception:', error, errorInfo);
  }

  public handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-obsidian-950 text-slate-800 dark:text-slate-100">
          <div className="max-w-md w-full glass-panel p-8 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 text-center space-y-5 shadow-2xl">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-vital-coral/10 text-vital-coral flex items-center justify-center text-2xl font-black">
              ⚠
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight">System Display Recovery</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                A rendering anomaly was safely captured. Your underlying telemetry is preserved.
              </p>
              {this.state.error && (
                <div className="p-3 mt-3 text-left font-mono text-[11px] bg-slate-100 dark:bg-slate-900 rounded-lg text-slate-600 dark:text-slate-300 overflow-x-auto max-h-32">
                  {this.state.error.message}
                </div>
              )}
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-200/80 dark:bg-slate-800/80 hover:bg-slate-300 dark:hover:bg-slate-700 transition"
              >
                Retry View
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-primary-600 hover:bg-primary-500 shadow-md shadow-primary-500/20 transition"
              >
                Reload Platform
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

