import React, { useEffect, useState } from 'react';
import { transactionLogger, TransactionLogItem } from '../lib/transactionLogger';
import { AlertTriangle, CheckCircle, Info, X, ChevronDown, ChevronUp } from 'lucide-react';

export const TransactionErrorOverlay: React.FC = () => {
  const [logs, setLogs] = useState<TransactionLogItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = transactionLogger.subscribe((updatedLogs) => {
      setLogs(updatedLogs);
    });
    return unsubscribe;
  }, []);

  if (logs.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] max-w-md w-full px-4 pointer-events-none flex flex-col gap-2">
      {logs.slice(0, 3).map((item) => {
        const isError = item.type === 'error';
        const isWarning = item.type === 'warning';
        const isExpanded = expandedId === item.id;

        const bgColor = isError
          ? 'bg-amber-900/90 border-amber-600 text-amber-50'
          : isWarning
          ? 'bg-stone-900/90 border-stone-600 text-stone-100'
          : 'bg-emerald-950/90 border-emerald-600 text-emerald-50';

        return (
          <div
            key={item.id}
            className={`pointer-events-auto rounded-xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 animate-fade-in ${bgColor}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                {isError && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
                {isWarning && <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />}
                {!isError && !isWarning && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
                
                <div>
                  <div className="text-xs font-semibold tracking-wider uppercase opacity-75 mb-0.5">
                    {item.source} • {item.timestamp}
                  </div>
                  <div className="text-sm font-semibold">{item.title}</div>
                  <p className="text-xs opacity-90 mt-1 line-clamp-2">{item.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {item.details && (
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors text-xs flex items-center gap-1 opacity-80"
                    title="Details anzeigen"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                )}
                <button
                  onClick={() => transactionLogger.dismissLog(item.id)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors opacity-70 hover:opacity-100"
                  title="Schließen"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {isExpanded && item.details && (
              <div className="mt-3 pt-2 border-t border-white/10 text-[11px] font-mono bg-black/30 p-2 rounded-lg overflow-x-auto max-h-40">
                <pre>{typeof item.details === 'string' ? item.details : JSON.stringify(item.details, null, 2)}</pre>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
