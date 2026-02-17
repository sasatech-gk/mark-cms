import { open } from "@tauri-apps/plugin-dialog";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRegisteredWorkspaces, registerWorkspace } from "../../commands/workspace";
import { useLocale } from "../../hooks/useLocale";
import { useWorkspace } from "../../hooks/useWorkspace";
import type { RegisteredWorkspace } from "../../types/workspace";
import "./Sidebar.css";

export function Sidebar() {
	const { config, path, open: openWorkspace, close } = useWorkspace();
	const { t } = useLocale();
	const navigate = useNavigate();
	const { contentTypeId } = useParams();

	const [showSwitcher, setShowSwitcher] = useState(false);
	const [registeredWorkspaces, setRegisteredWorkspaces] = useState<RegisteredWorkspace[]>([]);
	const switcherRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (showSwitcher) {
			getRegisteredWorkspaces()
				.then(setRegisteredWorkspaces)
				.catch((e) => console.error("Failed to load workspaces:", e));
		}
	}, [showSwitcher]);

	useEffect(() => {
		if (!showSwitcher) return;
		const handleClickOutside = (e: MouseEvent) => {
			if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
				setShowSwitcher(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [showSwitcher]);

	const handleSwitchWorkspace = async (wsPath: string) => {
		setShowSwitcher(false);
		const success = await openWorkspace(wsPath);
		if (success) navigate("/");
	};

	const handleRegisterNew = async () => {
		const selected = await open({ directory: true });
		if (selected) {
			await registerWorkspace(selected);
			const success = await openWorkspace(selected);
			setShowSwitcher(false);
			if (success) navigate("/");
		}
	};

	return (
		<aside className="sidebar" aria-label={t.appName}>
			<div className="sidebar-header" ref={switcherRef}>
				<button
					type="button"
					className="sidebar-title-btn"
					onClick={() => setShowSwitcher(!showSwitcher)}
				>
					<span className="sidebar-title">{config?.name ?? t.appName}</span>
					<span className="sidebar-title-chevron">{showSwitcher ? "▲" : "▼"}</span>
				</button>
				{path && (
					<button
						type="button"
						className="sidebar-btn-icon"
						onClick={() => {
							close();
							navigate("/");
						}}
						title={t.closeWorkspace}
					>
						&times;
					</button>
				)}
				{showSwitcher && (
					<div className="sidebar-switcher">
						<div className="sidebar-switcher-label">{t.registeredWorkspaces}</div>
						{registeredWorkspaces.length === 0 ? (
							<div className="sidebar-switcher-empty">{t.noWorkspacesRegistered}</div>
						) : (
							<ul className="sidebar-switcher-list">
								{registeredWorkspaces.map((ws) => (
									<li key={ws.path}>
										<button
											type="button"
											className={`sidebar-switcher-item${ws.path === path ? " active" : ""}`}
											onClick={() => handleSwitchWorkspace(ws.path)}
										>
											<span className="sidebar-switcher-name">{ws.name}</span>
											<span className="sidebar-switcher-path">{ws.path}</span>
										</button>
									</li>
								))}
							</ul>
						)}
						<button type="button" className="sidebar-switcher-add" onClick={handleRegisterNew}>
							+ {t.registerWorkspace}
						</button>
					</div>
				)}
			</div>

			{config && (
				<nav className="sidebar-nav" aria-label={t.contentTypes}>
					<div className="sidebar-section-label">{t.contentTypes}</div>
					{config.contentTypes.length === 0 ? (
						<div className="sidebar-empty">{t.noContentTypesYet}</div>
					) : (
						<ul className="sidebar-list">
							{config.contentTypes.map((ct) => (
								<li key={ct.id}>
									<button
										type="button"
										className={`sidebar-item ${contentTypeId === ct.id ? "active" : ""}`}
										onClick={() => navigate(`/content/${ct.id}`)}
									>
										<span className="sidebar-item-icon">&#9776;</span>
										<span>{ct.name}</span>
									</button>
								</li>
							))}
						</ul>
					)}
				</nav>
			)}

			<div className="sidebar-footer">
				{config && (
					<button
						type="button"
						className="sidebar-footer-btn"
						onClick={() => navigate("/settings")}
					>
						{t.settings}
					</button>
				)}
				<button
					type="button"
					className="sidebar-footer-btn"
					onClick={() => navigate("/global-settings")}
				>
					{t.globalSettings}
				</button>
			</div>
		</aside>
	);
}
