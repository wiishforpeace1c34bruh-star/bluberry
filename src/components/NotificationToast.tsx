import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface NotificationToastProps {
    toast: Toast;
    onDismiss: (id: string) => void;
}

const toastConfig = {
    success: {
        icon: CheckCircle,
        className: 'bg-green-500/10 border-green-500/30 text-green-400',
        iconColor: 'text-green-400',
    },
    error: {
        icon: AlertCircle,
        className: 'bg-red-500/10 border-red-500/30 text-red-400',
        iconColor: 'text-red-400',
    },
    info: {
        icon: Info,
        className: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
        iconColor: 'text-blue-400',
    },
    warning: {
        icon: AlertTriangle,
        className: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
        iconColor: 'text-yellow-400',
    },
};

export function NotificationToast({ toast, onDismiss }: NotificationToastProps) {
    const [isExiting, setIsExiting] = useState(false);
    const [progress, setProgress] = useState(100);
    const config = toastConfig[toast.type];
    const Icon = config.icon;
    const duration = toast.duration || 5000;

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                const decrement = (100 / duration) * 50;
                return Math.max(0, prev - decrement);
            });
        }, 50);

        const timer = setTimeout(() => {
            handleDismiss();
        }, duration);

        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, [duration]);

    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(() => onDismiss(toast.id), 300);
    };

    return (
        <div
            className={`
        relative flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md
        shadow-lg ${config.className}
        ${isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'}
        min-w-[300px] max-w-[400px]
      `}
        >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />

            <p className="flex-1 text-sm font-medium text-foreground">
                {toast.message}
            </p>

            <button
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 -m-1"
            >
                <X className="w-4 h-4" />
            </button>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-background/20 rounded-b-xl overflow-hidden">
                <div
                    className={`h-full ${config.iconColor.replace('text-', 'bg-')} transition-all duration-50 ease-linear`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}

// Toast Container Component
interface ToastContainerProps {
    toasts: Toast[];
    onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
    return (
        <div className="fixed top-4 right-4 z-[9998] flex flex-col gap-3 pointer-events-none">
            <div className="flex flex-col gap-3 pointer-events-auto">
                {toasts.map((toast) => (
                    <NotificationToast key={toast.id} toast={toast} onDismiss={onDismiss} />
                ))}
            </div>
        </div>
    );
}
