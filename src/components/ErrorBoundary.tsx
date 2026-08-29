import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-md w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-600 mx-auto flex items-center justify-center">
              <AlertCircle size={28} />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif font-bold text-2xl text-[var(--text-main)]">
                Kurze Atempause
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Hier ist ein kleiner technischer Schluckauf aufgetreten. Bitte lade die Seite einmal neu oder kehre zur Startseite zurück.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex-1 py-3 px-4 rounded-2xl bg-[var(--accent)] hover:opacity-90 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>Seite neu laden</span>
              </button>

              <a
                href="/"
                className="flex-1 py-3 px-4 rounded-2xl bg-[var(--bg-alt)] hover:bg-[var(--border)] text-[var(--text-main)] font-semibold text-xs border border-[var(--border)] transition-all flex items-center justify-center gap-2"
              >
                <Home size={14} />
                <span>Zur Startseite</span>
              </a>
            </div>

            {this.state.error && (
              <details className="text-left text-[11px] text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
                <summary className="cursor-pointer font-mono hover:underline">
                  Fehlerdetails anzeigen
                </summary>
                <pre className="mt-2 p-3 bg-neutral-900 text-neutral-100 rounded-xl overflow-x-auto text-[10px] leading-relaxed font-mono whitespace-pre-wrap">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
