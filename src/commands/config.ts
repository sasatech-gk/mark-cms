import { invoke } from "@tauri-apps/api/core";
import type { WorkspaceConfig } from "../types/workspace";

export async function readConfig(workspacePath: string): Promise<WorkspaceConfig> {
	return invoke("read_config", { workspacePath });
}

export async function writeConfig(workspacePath: string, config: WorkspaceConfig): Promise<void> {
	return invoke("write_config", { workspacePath, config });
}
