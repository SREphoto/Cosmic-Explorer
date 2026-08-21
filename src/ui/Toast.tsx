import React, { useEffect, useState } from 'react';
import { CheckCircle2, Sparkles, Award } from 'lucide-react';

export type ToastType = 'SKIN_UNLOCK' | 'QUEST_COMPLETE' | 'SUCCESS' | 'GENERIC' | 'LEVEL_UP' | 'MILESTONE' | 'COMBO';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const getIcon = () => {
    switch (toast.type) {
      case 'SKIN_UNLOCK':
        return <Sparkles className="w-5 h-5 text-sky-400" />;
      case 'QUEST_COMPLETE':
        return <Award className="w-5 h-5 text-amber-400" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="flex items-center gap-3 bg-slate-900 border border-slate-700/80 shadow-2xl rounded-2xl p-3 pr-4 animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto">
      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
        {getIcon()}
      </div>
      <div>
        <h4 className="text-sm font-bold text-white leading-tight">{toast.title}</h4>
        <p className="text-xs text-slate-300 mt-0.5">{toast.message}</p>
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToast = (e: CustomEvent<ToastMessage>) => {
      setToasts((prev) => [...prev, e.detail]);
    };

    window.addEventListener('show-toast', handleToast as EventListener);
    return () => window.removeEventListener('show-toast', handleToast as EventListener);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
};

export const showToast = (type: ToastType, title: string, message: string) => {
  const event = new CustomEvent('show-toast', {
    detail: { id: Date.now().toString(), type, title, message }
  });
  window.dispatchEvent(event);
};
