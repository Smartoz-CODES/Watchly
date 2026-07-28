import { createContext } from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastState {
  id: number;
  title: string;
  description: string;
  type: ToastType;
}

export interface ToastContextValue {
  toast: ToastState | null;
  showToast: (title: string, description: string, type: ToastType) => void;
  clearToast: () => void;
}

export const ToastContext = createContext<ToastContextValue | undefined>(
  undefined,
);
