import type { ContentType } from "./content";

export interface WorkspaceConfig {
	version: number;
	name: string;
	contentTypes: ContentType[];
}

export interface RegisteredWorkspace {
	path: string;
	name: string;
	registeredAt: string;
}
