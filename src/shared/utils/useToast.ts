import { useAtom } from "jotai";
import { addToastAtom, type ToastType } from "#/atoms";

export function useToast() {
  const [, addToast] = useAtom(addToastAtom);

  const toast = {
    success: (title: string, message?: string) => {
      addToast({
        type: 'success' as ToastType,
        title,
        message,
        duration: 4000,
      });
    },
    error: (title: string, message?: string) => {
      addToast({
        type: 'error' as ToastType,
        title,
        message,
        duration: 6000,
      });
    },
    warning: (title: string, message?: string) => {
      addToast({
        type: 'warning' as ToastType,
        title,
        message,
        duration: 5000,
      });
    },
    info: (title: string, message?: string) => {
      addToast({
        type: 'info' as ToastType,
        title,
        message,
        duration: 4000,
      });
    },
  };

  return toast;
}
