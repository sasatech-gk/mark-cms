export type FieldType =
	| "string"
	| "text"
	| "number"
	| "boolean"
	| "date"
	| "datetime"
	| "select"
	| "string[]";

export interface FrontMatterFieldDef {
	name: string;
	type: FieldType;
	required: boolean;
	default: unknown;
	options?: string[];
	description?: string;
}

export interface FrontMatterSchema {
	fields: FrontMatterFieldDef[];
}

export interface ContentType {
	id: string;
	name: string;
	slug: string;
	folder: string;
	sortField: string;
	sortOrder: "asc" | "desc";
	frontMatter: FrontMatterSchema;
}

export interface MarkdownFileSummary {
	relativePath: string;
	filename: string;
	frontMatter: Record<string, unknown>;
	modifiedAt: string;
}

export interface MarkdownFileContent {
	relativePath: string;
	filename: string;
	frontMatter: Record<string, unknown>;
	content: string;
	rawContent: string;
	modifiedAt: string;
}
