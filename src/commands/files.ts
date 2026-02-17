import { invoke } from "@tauri-apps/api/core";
import type { MarkdownFileContent, MarkdownFileSummary } from "../types/content";
import type { WorkspaceConfig } from "../types/workspace";

export async function listFiles(
	workspacePath: string,
	contentTypeId: string,
	config: WorkspaceConfig,
): Promise<MarkdownFileSummary[]> {
	return invoke("list_files", { workspacePath, contentTypeId, config });
}

export async function readFile(
	workspacePath: string,
	filePath: string,
): Promise<MarkdownFileContent> {
	return invoke("read_file", { workspacePath, filePath });
}

export async function writeFile(
	workspacePath: string,
	filePath: string,
	frontMatter: Record<string, unknown>,
	content: string,
): Promise<void> {
	return invoke("write_file", {
		workspacePath,
		filePath,
		frontMatter,
		content,
	});
}

export async function createFile(
	workspacePath: string,
	contentTypeId: string,
	filename: string,
	frontMatter: Record<string, unknown>,
	content: string,
	config: WorkspaceConfig,
): Promise<string> {
	return invoke("create_file", {
		workspacePath,
		contentTypeId,
		filename,
		frontMatter,
		content,
		config,
	});
}

export async function readFileByName(
	workspacePath: string,
	contentTypeId: string,
	filename: string,
	config: WorkspaceConfig,
): Promise<MarkdownFileContent> {
	return invoke("read_file_by_name", { workspacePath, contentTypeId, filename, config });
}

export async function deleteFile(workspacePath: string, filePath: string): Promise<void> {
	return invoke("delete_file", { workspacePath, filePath });
}

export async function renameFile(
	workspacePath: string,
	oldPath: string,
	newPath: string,
): Promise<void> {
	return invoke("rename_file", { workspacePath, oldPath, newPath });
}
