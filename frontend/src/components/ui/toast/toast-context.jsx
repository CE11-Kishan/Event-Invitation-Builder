import { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '../../../lib/utils';
import { X } from 'lucide-react';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts(ts => ts.filter(t => t.id !== id));
  }, []);

  const push = useCallback(({ title, description, type = 'default', duration = 4000 }) => {
    const id = ++idCounter;
    const toast = { id, title, description, type, duration };
    setToasts(ts => [...ts, toast]);
    if (duration !== Infinity) {
      setTimeout(() => dismiss(id), duration);
    }
    return id;
  }, [dismiss]);

  const value = { push, dismiss };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed z-50 top-4 right-4 flex flex-col gap-2 w-80">
        {toasts.map(t => (
          <div key={t.id} className={cn(
            'group relative overflow-hidden rounded-md border text-sm shadow-sm animate-in fade-in slide-in-from-right-4 bg-white border-gray-200',
            t.type === 'success' && 'border-green-200 bg-green-50',
            t.type === 'error' && 'border-red-200 bg-red-50',
            t.type === 'info' && 'border-blue-200 bg-blue-50'
          )}>
            <button onClick={() => dismiss(t.id)} className="absolute top-1 right-1 p-1 rounded hover:bg-black/5 text-gray-500" aria-label="Close">
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="p-3 pr-7 space-y-1">
              {t.title && <p className="font-medium leading-none tracking-tight text-gray-900">{t.title}</p>}
              {t.description && <p className="text-xs text-gray-600 leading-snug">{t.description}</p>}
            </div>
            <div className={cn('absolute left-0 bottom-0 h-0.5 bg-gray-300',
              t.type === 'success' && 'bg-green-400',
              t.type === 'error' && 'bg-red-400',
              t.type === 'info' && 'bg-blue-400'
            )} style={{ animation: 'shrink linear forwards', animationDuration: (t.duration === Infinity ? 0 : t.duration) + 'ms' }} />
          </div>
        ))}
      </div>
      <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
