import { useNavigate } from "react-router-dom";
import { useLocale } from "../../hooks/useLocale";
import "./ErrorFallback.css";

interface ErrorFallbackProps {
	error: Error;
	onReset?: () => void;
}

export function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
	const { t } = useLocale();
	const navigate = useNavigate();

	return (
		<div className="error-fallback">
			<h2>{t.errorOccurred}</h2>
			<p className="error-fallback-message">{error.message}</p>
			<div className="error-fallback-actions">
				<button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
					{t.goBack}
				</button>
				<button type="button" className="btn-secondary" onClick={() => navigate("/")}>
					{t.backToHome}
				</button>
				{onReset && (
					<button type="button" className="btn-primary" onClick={onReset}>
						{t.retry}
					</button>
				)}
			</div>
		</div>
	);
}
