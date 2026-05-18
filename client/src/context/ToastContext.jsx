import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

const iconMap = {
  success: <CheckCircle size={20} />,
  error: <XCircle size={20} />,
  warning: <AlertTriangle size={20} />,
  info: <Info size={20} />
};

const colorMap = {
  success: { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.4)', color: '#22c55e' },
  error: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' },
  warning: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', color: '#f59e0b' },
  info: { bg: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.4)', color: '#6366f1' }
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div style={{
        position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: '0.75rem',
        pointerEvents: 'none', maxWidth: '420px', width: '100%'
      }}>
        {toasts.map(toast => {
          const colors = colorMap[toast.type] || colorMap.info;
          return (
            <div
              key={toast.id}
              className="animate-fade-in"
              style={{
                pointerEvents: 'auto',
                background: colors.bg,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: `1px solid ${colors.border}`,
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: 'var(--text-primary, #fff)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                animation: 'toast-slide-in 0.35s cubic-bezier(0.22, 1, 0.36, 1)'
              }}
            >
              <div style={{ color: colors.color, flexShrink: 0 }}>
                {iconMap[toast.type]}
              </div>
              <p style={{ margin: 0, flex: 1, fontSize: '0.9rem', lineHeight: 1.4 }}>{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none', border: 'none', color: 'var(--text-muted, #999)',
                  cursor: 'pointer', padding: '2px', flexShrink: 0, display: 'flex'
                }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
