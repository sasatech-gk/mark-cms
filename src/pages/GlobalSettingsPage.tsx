import { useLocale } from "../hooks/useLocale";
import { useTheme } from "../hooks/useTheme";
import "./GlobalSettingsPage.css";

export function GlobalSettingsPage() {
	const { theme, toggleTheme } = useTheme();
	const { t, locale, locales, setLocale } = useLocale();

	return (
		<div className="global-settings-page">
			<h1>{t.globalSettings}</h1>

			<section className="global-settings-section">
				<h2>{t.appearance}</h2>
				<div className="global-settings-card">
					<div className="global-settings-row">
						<span className="global-settings-label">{t.theme}</span>
						<div className="global-settings-theme-toggle">
							<button
								type="button"
								className={`global-settings-theme-btn ${theme === "light" ? "active" : ""}`}
								onClick={() => theme !== "light" && toggleTheme()}
							>
								{t.lightMode}
							</button>
							<button
								type="button"
								className={`global-settings-theme-btn ${theme === "dark" ? "active" : ""}`}
								onClick={() => theme !== "dark" && toggleTheme()}
							>
								{t.darkMode}
							</button>
						</div>
					</div>
				</div>
			</section>

			<section className="global-settings-section">
				<h2>{t.language}</h2>
				<div className="global-settings-card">
					<div className="global-settings-lang-grid">
						{locales.map((l) => (
							<button
								key={l.code}
								type="button"
								className={`global-settings-lang-btn ${locale === l.code ? "active" : ""}`}
								onClick={() => setLocale(l.code)}
							>
								{l.label}
							</button>
						))}
					</div>
				</div>
			</section>
		</div>
	);
}
