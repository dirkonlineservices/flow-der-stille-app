export interface TransactionLogItem {
  id: string;
  timestamp: string;
  type: 'error' | 'warning' | 'success';
  title: string;
  message: string;
  details?: Record<string, any> | string;
  source: 'supabase_db' | 'edge_function' | 'paypal' | 'auth' | 'general';
}

type LogListener = (logs: TransactionLogItem[]) => void;

class TransactionLogger {
  private logs: TransactionLogItem[] = [];
  private listeners: Set<LogListener> = new Set();

  public subscribe(listener: LogListener): () => void {
    this.listeners.add(listener);
    listener([...this.logs]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const logCopy = [...this.logs];
    this.listeners.forEach((listener) => listener(logCopy));
  }

  public logError(
    title: string,
    error: any,
    source: TransactionLogItem['source'] = 'supabase_db',
    details?: Record<string, any>
  ): TransactionLogItem {
    const errorMessage = error?.message || error?.details || String(error);
    const item: TransactionLogItem = {
      id: 'tx_err_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toLocaleTimeString(),
      type: 'error',
      title,
      message: errorMessage,
      details: details || error,
      source,
    };

    this.logs.unshift(item);

    // Console output for developer inspection
    console.group(`❌ [Transaction Error] ${title} (${source})`);
    console.error('Message:', errorMessage);
    if (details) console.error('Context:', details);
    if (error) console.error('Raw Error Object:', error);
    console.groupEnd();

    this.notify();
    return item;
  }

  public logWarning(
    title: string,
    message: string,
    source: TransactionLogItem['source'] = 'supabase_db',
    details?: Record<string, any>
  ): TransactionLogItem {
    const item: TransactionLogItem = {
      id: 'tx_warn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toLocaleTimeString(),
      type: 'warning',
      title,
      message,
      details,
      source,
    };

    this.logs.unshift(item);

    console.group(`⚠️ [Transaction Warning] ${title} (${source})`);
    console.warn('Message:', message);
    if (details) console.warn('Details:', details);
    console.groupEnd();

    this.notify();
    return item;
  }

  public logSuccess(
    title: string,
    message: string,
    source: TransactionLogItem['source'] = 'supabase_db',
    details?: Record<string, any>
  ): TransactionLogItem {
    const item: TransactionLogItem = {
      id: 'tx_ok_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toLocaleTimeString(),
      type: 'success',
      title,
      message,
      details,
      source,
    };

    this.logs.unshift(item);

    console.group(`✅ [Transaction Success] ${title} (${source})`);
    console.log('Message:', message);
    if (details) console.log('Details:', details);
    console.groupEnd();

    this.notify();
    return item;
  }

  public clearLogs() {
    this.logs = [];
    this.notify();
  }

  public dismissLog(id: string) {
    this.logs = this.logs.filter((item) => item.id !== id);
    this.notify();
  }

  public getLogs(): TransactionLogItem[] {
    return [...this.logs];
  }
}

export const transactionLogger = new TransactionLogger();

if (typeof window !== 'undefined') {
  (window as any).transactionLogger = transactionLogger;
}
