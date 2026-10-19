import React from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import Modal from "../common/Modal";
import Button from "../common/Button";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed with this operation? This action may be irreversible.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // "danger" | "primary"
  isLoading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-rose-400">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{title}</span>
        </div>
      }
      size="sm"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            size="sm"
            onClick={onConfirm}
            loading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 font-mono text-xs text-slate-300">
        <p className="leading-relaxed">{message}</p>
      </div>
    </Modal>
  );
}
