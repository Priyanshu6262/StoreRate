import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg, duration) => addToast(msg, 'success', duration), [addToast]);
  const error = useCallback((msg, duration) => addToast(msg, 'error', duration), [addToast]);
  const warning = useCallback((msg, duration) => addToast(msg, 'warning', duration), [addToast]);
  const info = useCallback((msg, duration) => addToast(msg, 'info', duration), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, warning, info, addToast, removeToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const typeConfig = {
            success: {
              bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
              icon: <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
            },
            error: {
              bg: 'bg-rose-50 border-rose-200 text-rose-900',
              icon: <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
            },
            warning: {
              bg: 'bg-amber-50 border-amber-200 text-amber-900',
              icon: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
            },
            info: {
              bg: 'bg-blue-50 border-blue-200 text-blue-900',
              icon: <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />,
            },
          }[toast.type] || {
            bg: 'bg-slate-50 border-slate-200 text-slate-900',
            icon: <Info className="w-5 h-5 text-slate-600 flex-shrink-0" />,
          };

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start p-3.5 rounded-xl border shadow-lg transition-all duration-300 transform translate-y-0 ${typeConfig.bg}`}
            >
              <div className="mr-3 mt-0.5">{typeConfig.icon}</div>
              <div className="flex-1 text-sm font-medium leading-snug">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-2 text-slate-400 hover:text-slate-600 transition p-0.5 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
