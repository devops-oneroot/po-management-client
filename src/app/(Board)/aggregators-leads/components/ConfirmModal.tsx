import { ConfirmModalProps } from "../types";

export function ConfirmModal({
  show,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "info",
}: ConfirmModalProps) {
  if (!show) return null;

  const confirmButtonColor =
    type === "danger"
      ? "bg-red-600 hover:bg-red-700"
      : type === "warning"
      ? "bg-yellow-600 hover:bg-yellow-700"
      : "bg-blue-600 hover:bg-blue-700";

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[90]"
      style={{ zIndex: 2100 }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-fadeIn">
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded transition-colors ${confirmButtonColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
