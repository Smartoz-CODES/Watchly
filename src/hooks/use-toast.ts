import { useContext } from "react";
import { ToastContext, type ToastContextValue } from "../context/ToastContext";

// Used by every hook and page that needs to show a notification
export function useToast(): Pick<ToastContextValue, "showToast"> {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return { showToast: context.showToast };
}

// Used exclusively by Toast.tsx to read state and clear the toast
export function useToastState(): Pick<
  ToastContextValue,
  "toast" | "clearToast"
> {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToastState must be used inside ToastProvider");
  }

  return { toast: context.toast, clearToast: context.clearToast };
}
