import { useEffect, useRef } from "react";
import { useLocale } from "../../hooks/useLocale";
import { Modal } from "./Modal";
import "./ConfirmDialog.css";

interface ConfirmDialogProps {
	message: string;
	confirmLabel?: string;
	variant?: "danger" | "default";
	onConfirm: () => void;
	onCancel: () => void;
}

export function ConfirmDialog({
	message,
	confirmLabel,
	variant = "default",
	onConfirm,
	onCancel,
}: ConfirmDialogProps) {
	const { t } = useLocale();
	const confirmRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		confirmRef.current?.focus();
	}, []);

	return (
		<Modal onClose={onCancel} maxWidth={400}>
			<p className="confirm-dialog-message">{message}</p>
			<div className="confirm-dialog-actions">
				<button
					ref={confirmRef}
					type="button"
					className={variant === "danger" ? "btn-danger" : "btn-primary"}
					onClick={onConfirm}
				>
					{confirmLabel ?? t.delete}
				</button>
				<button type="button" className="btn-secondary" onClick={onCancel}>
					{t.cancel}
				</button>
			</div>
		</Modal>
	);
}
