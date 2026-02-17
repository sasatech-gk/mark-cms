import { invoke } from "@tauri-apps/api/core";
import type { RegisteredWorkspace, WorkspaceConfig } from "../types/workspace";

export async function openWorkspace(path: string): Promise<WorkspaceConfig> {
	return invoke("open_workspace", { path });
}

export async function initWorkspace(path: string, name: string): Promise<WorkspaceConfig> {
	return invoke("init_workspace", { path, name });
}

export async function getRegisteredWorkspaces(): Promise<RegisteredWorkspace[]> {
	return invoke("get_registered_workspaces");
}

export async function registerWorkspace(path: string): Promise<RegisteredWorkspace> {
	return invoke("register_workspace", { path });
}

export async function unregisterWorkspace(path: string): Promise<void> {
	return invoke("unregister_workspace", { path });
}

export async function migrateRecentToRegistered(): Promise<boolean> {
	return invoke("migrate_recent_to_registered");
}
