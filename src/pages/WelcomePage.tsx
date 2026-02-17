import { open } from "@tauri-apps/plugin-dialog";
import { useEffect, useState } from "react";
import {
	getRegisteredWorkspaces,
	migrateRecentToRegistered,
	registerWorkspace,
	unregisterWorkspace,
} from "../commands/workspace";
import { ConfirmDialog } from "../components/shared/ConfirmDialog";
import { useLocale } from "../hooks/useLocale";
import { useWorkspace } from "../hooks/useWorkspace";
import type { RegisteredWorkspace } from "../types/workspace";
import "./WelcomePage.css";

export function WelcomePage() {
	const { open: openWorkspace, config, isLoading, error } = useWorkspace();
	const { t } = useLocale();
	const [workspaces, setWorkspaces] = useState<RegisteredWorkspace[]>([]);
	const [removeTarget, setRemoveTarget] = useState<string | null>(null);

	useEffect(() => {
		migrateRecentToRegistered()
			.catch((e) => console.error("Failed to migrate workspaces:", e))
			.finally(() => {
				getRegisteredWorkspaces()
					.then(setWorkspaces)
					.catch((e) => console.error("Failed to load workspaces:", e));
			});
	}, []);

	const handleRegisterAndOpen = async () => {
		const selected = await open({ directory: true });
		if (selected) {
			const registered = await registerWorkspace(selected);
			setWorkspaces((prev) => [registered, ...prev.filter((w) => w.path !== registered.path)]);
			await openWorkspace(selected);
		}
	};

	const handleUnregister = async () => {
		if (!removeTarget) return;
		await unregisterWorkspace(removeTarget);
		setWorkspaces((prev) => prev.filter((w) => w.path !== removeTarget));
		setRemoveTarget(null);
	};

	if (config) {
		return (
			<div className="welcome">
				<h1>
					{t.welcomeTo} {config.name}
				</h1>
				<p className="welcome-sub">
					{config.contentTypes.length > 0 ? t.welcomeSubWithTypes : t.welcomeSubNoTypes}
				</p>
			</div>
		);
	}

	return (
		<div className="welcome">
			<h1>{t.appName}</h1>
			<p className="welcome-sub">{t.welcomeSubNoWorkspace}</p>
			{error && <p className="welcome-error">{error}</p>}
			{isLoading ? (
				<p className="welcome-sub">{t.openingWorkspace}</p>
			) : (
				<button type="button" className="welcome-btn" onClick={handleRegisterAndOpen}>
					{t.registerWorkspace}
				</button>
			)}

			{workspaces.length > 0 && (
				<div className="welcome-workspaces">
					<h3>{t.registeredWorkspaces}</h3>
					<div className="welcome-workspace-list">
						{workspaces.map((ws) => (
							// biome-ignore lint/a11y/useSemanticElements: div with role="button" used intentionally to avoid nesting <button> inside <button>
							<div
								key={ws.path}
								className="welcome-workspace-card"
								role="button"
								tabIndex={0}
								onClick={() => openWorkspace(ws.path)}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										openWorkspace(ws.path);
									}
								}}
							>
								<div className="welcome-workspace-info">
									<span className="welcome-workspace-name">{ws.name}</span>
									<span className="welcome-workspace-path">{ws.path}</span>
								</div>
								<button
									type="button"
									className="welcome-workspace-remove"
									onClick={(e) => {
										e.stopPropagation();
										setRemoveTarget(ws.path);
									}}
									title={t.removeWorkspace}
								>
									&times;
								</button>
							</div>
						))}
					</div>
				</div>
			)}

			{removeTarget && (
				<ConfirmDialog
					message={t.confirmRemoveWorkspace}
					variant="danger"
					confirmLabel={t.delete}
					onConfirm={handleUnregister}
					onCancel={() => setRemoveTarget(null)}
				/>
			)}
		</div>
	);
}
