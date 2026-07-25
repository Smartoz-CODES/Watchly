import {
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { ToastContext, type ToastState, type ToastType } from "./ToastContext";

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  const showToast = useCallback(
    (title: string, description: string, type: ToastType) => {
      setToast({ title, description, type, id: Date.now() });
    },
    []
  );

  useEffect(() => {
    if (!toast) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setToast(null);
    }, 5000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [toast]);

  return (
    <ToastContext.Provider value={{ toast, showToast, clearToast }}>
      {children}
    </ToastContext.Provider>
  );
}
