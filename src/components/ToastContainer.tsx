"use client";

import { useAtom } from "jotai";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
  ExternalLink,
} from "lucide-react";
import { toastsAtom, removeToastAtom, type Toast } from "#/atoms";

function ToastItem({ toast }: { toast: Toast }) {
  const [, removeToast] = useAtom(removeToastAtom);

  const styles = {
    success: {
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800",
      icon: (
        <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
      ),
      title: "text-green-800 dark:text-green-200",
      message: "text-green-600 dark:text-green-400",
    },
    error: {
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-800",
      icon: <XCircle size={16} className="text-red-600 dark:text-red-400" />,
      title: "text-red-800 dark:text-red-200",
      message: "text-red-600 dark:text-red-400",
    },
    warning: {
      bg: "bg-amber-50 dark:bg-amber-900/20",
      border: "border-amber-200 dark:border-amber-800",
      icon: (
        <AlertTriangle
          size={16}
          className="text-amber-600 dark:text-amber-400"
        />
      ),
      title: "text-amber-800 dark:text-amber-200",
      message: "text-amber-600 dark:text-amber-400",
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-800",
      icon: <Info size={16} className="text-blue-600 dark:text-blue-400" />,
      title: "text-blue-800 dark:text-blue-200",
      message: "text-blue-600 dark:text-blue-400",
    },
  };

  const style = styles[toast.type] || styles.info;

  return (
    <div
      className={`
        mb-2 p-3 rounded-lg border shadow-sm
        ${style.bg} ${style.border}
        animate-in slide-in-from-right-5 fade-in duration-200
      `}
    >
      <div className="flex items-start gap-2.5">
        <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${style.title}`}>{toast.title}</p>
          {toast.message && (
            <p className={`text-xs mt-0.5 ${style.message}`}>{toast.message}</p>
          )}
          {toast.link && (
            <a
              href={toast.link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs mt-1 text-primary hover:underline"
            >
              {toast.link.text}
              <ExternalLink size={10} />
            </a>
          )}
        </div>
        <button
          type="button"
          onClick={() => removeToast(toast.id)}
          className="flex-shrink-0 p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <X size={14} className="text-gray-400" />
        </button>
      </div>
    </div>
  );
}

export default function ToastContainer() {
  const [toasts] = useAtom(toastsAtom);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-72">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
