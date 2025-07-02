import { useAtom } from "jotai";
import { Card, CardBody, Button } from "@nextui-org/react";
import { toastsAtom, removeToastAtom, type Toast } from "#/atoms";

function ToastItem({ toast }: { toast: Toast }) {
  const [, removeToast] = useAtom(removeToastAtom);

  const getToastColor = (type: Toast['type']) => {
    switch (type) {
    case 'success':
      return 'success';
    case 'error':
      return 'danger';
    case 'warning':
      return 'warning';
    case 'info':
    default:
      return 'primary';
    }
  };

  const getToastIcon = (type: Toast['type']) => {
    switch (type) {
    case 'success':
      return '✅';
    case 'error':
      return '❌';
    case 'warning':
      return '⚠️';
    case 'info':
    default:
      return 'ℹ️';
    }
  };

  return (
    <Card
      className={`mb-2 shadow-lg border-l-4 border-l-${getToastColor(type)} animate-in slide-in-from-right duration-300`}
    >
      <CardBody className="flex flex-row items-start justify-between p-4">
        <div className="flex items-start space-x-3">
          <span className="text-lg">{getToastIcon(toast.type)}</span>
          <div className="flex-1">
            <h4 className="font-semibold text-sm">{toast.title}</h4>
            {toast.message && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {toast.message}
              </p>
            )}
          </div>
        </div>
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onClick={() => removeToast(toast.id)}
          className="ml-2"
        >
          ✕
        </Button>
      </CardBody>
    </Card>
  );
}

export default function ToastContainer() {
  const [toasts] = useAtom(toastsAtom);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-80 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
