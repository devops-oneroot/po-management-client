import { X } from "lucide-react";
import { ToastProps } from "../types";

export function Toast({ show, message, type, onClose }: ToastProps) {
  if (!show) return null;

  const bgColor =
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-blue-500";

  return (
    <div className="fixed top-4 right-4 z-[100] animate-fadeIn">
      <div
        className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]`}
      >
        <div className="flex-1">
          <p className="font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

