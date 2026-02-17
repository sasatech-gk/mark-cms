import { type ReactNode, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./Modal.css";

interface ModalProps {
	children: ReactNode;
	onClose: () => void;
	maxWidth?: number;
	ariaLabel?: string;
}

export function Modal({ children, onClose, maxWidth = 420, ariaLabel }: ModalProps) {
	const contentRef = useRef<HTMLDivElement>(null);

	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				onClose();
				return;
			}
			// Focus trap
			if (e.key === "Tab" && contentRef.current) {
				const focusable = contentRef.current.querySelectorAll<HTMLElement>(
					'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
				);
				if (focusable.length === 0) return;
				const first = focusable[0];
				const last = focusable[focusable.length - 1];
				if (e.shiftKey) {
					if (document.activeElement === first) {
						e.preventDefault();
						last.focus();
					}
				} else {
					if (document.activeElement === last) {
						e.preventDefault();
						first.focus();
					}
				}
			}
		},
		[onClose],
	);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		// Focus first focusable element on mount
		const timer = requestAnimationFrame(() => {
			const focusable = contentRef.current?.querySelector<HTMLElement>(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
			);
			focusable?.focus();
		});
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			cancelAnimationFrame(timer);
		};
	}, [handleKeyDown]);

	const overlay = (
		// biome-ignore lint/a11y/noStaticElementInteractions: Overlay backdrop dismiss pattern
		<div
			className="modal-overlay"
			role="presentation"
			onClick={onClose}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") onClose();
			}}
		>
			<div
				ref={contentRef}
				className="modal-content"
				style={{ maxWidth }}
				role="dialog"
				aria-modal="true"
				aria-label={ariaLabel}
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				{children}
			</div>
		</div>
	);

	return createPortal(overlay, document.body);
}
