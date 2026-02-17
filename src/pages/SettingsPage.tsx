import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConfirmDialog } from "../components/shared/ConfirmDialog";
import { useLocale } from "../hooks/useLocale";
import { useWorkspace } from "../hooks/useWorkspace";
import "./SettingsPage.css";

export function SettingsPage() {
	const { config, updateConfig } = useWorkspace();
	const { t } = useLocale();
	const navigate = useNavigate();
	const [deleteCtTarget, setDeleteCtTarget] = useState<string | null>(null);

	if (!config) return null;

	const handleDeleteContentType = async () => {
		if (!deleteCtTarget) return;
		const updated = {
			...config,
			contentTypes: config.contentTypes.filter((ct) => ct.id !== deleteCtTarget),
		};
		await updateConfig(updated);
		setDeleteCtTarget(null);
	};

	return (
		<div className="settings-page">
			<h1>{t.settings}</h1>

			<section className="settings-section">
				<div className="settings-section-header">
					<h2>{t.contentTypes}</h2>
					<button
						type="button"
						className="btn-primary"
						onClick={() => navigate("/settings/content-types/new")}
					>
						+ {t.addContentType}
					</button>
				</div>

				{config.contentTypes.length === 0 && (
					<p className="settings-empty">{t.noContentTypesConfigured}</p>
				)}

				<ul className="settings-ct-list">
					{config.contentTypes.map((ct) => (
						<li key={ct.id} className="settings-ct-item">
							<div className="settings-ct-info">
								<strong>{ct.name}</strong>
								<span className="settings-ct-meta">
									{ct.folder} &middot; {ct.frontMatter.fields.length} {t.fields}
								</span>
							</div>
							<div className="settings-ct-actions">
								<button
									type="button"
									className="btn-secondary"
									onClick={() => navigate(`/settings/content-types/${ct.id}`)}
								>
									{t.edit}
								</button>
								<button
									type="button"
									className="btn-danger-outline"
									onClick={() => setDeleteCtTarget(ct.id)}
								>
									{t.delete}
								</button>
							</div>
						</li>
					))}
				</ul>
			</section>

			{deleteCtTarget && (
				<ConfirmDialog
					message={t.confirmDeleteContentType}
					variant="danger"
					confirmLabel={t.delete}
					onConfirm={handleDeleteContentType}
					onCancel={() => setDeleteCtTarget(null)}
				/>
			)}
		</div>
	);
}
