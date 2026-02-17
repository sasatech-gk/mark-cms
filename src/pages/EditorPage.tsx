import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { listFiles, readFileByName, renameFile, writeFile } from "../commands/files";
import { TiptapEditor } from "../components/editor/TiptapEditor";
import { useLocale } from "../hooks/useLocale";
import { useWorkspace } from "../hooks/useWorkspace";
import type { MarkdownFileContent } from "../types/content";
import "./EditorPage.css";

export function EditorPage() {
	const { contentTypeId, filename } = useParams<{
		contentTypeId: string;
		filename: string;
	}>();
	const { path, config } = useWorkspace();
	const { t } = useLocale();
	const navigate = useNavigate();

	const [file, setFile] = useState<MarkdownFileContent | null>(null);
	const [frontMatter, setFrontMatter] = useState<Record<string, unknown>>({});
	const [isDirty, setIsDirty] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isRenaming, setIsRenaming] = useState(false);
	const [renameValue, setRenameValue] = useState("");
	const [renameError, setRenameError] = useState("");
	const renameInputRef = useRef<HTMLInputElement>(null);
	// Refs to hold latest values for handleSave, avoiding stale closures
	// in the Cmd+S keyboard shortcut handler
	const contentRef = useRef("");
	const frontMatterRef = useRef<Record<string, unknown>>({});

	const contentType = config?.contentTypes.find((ct) => ct.id === contentTypeId);

	useEffect(() => {
		if (!path || !config || !contentTypeId || !filename) return;

		setIsLoading(true);
		setError(null);

		const decodedFilename = decodeURIComponent(filename);

		readFileByName(path, contentTypeId, decodedFilename, config)
			.then((fileContent) => {
				setFile(fileContent);
				contentRef.current = fileContent.content;
				setFrontMatter(fileContent.frontMatter as Record<string, unknown>);
				setIsDirty(false);
			})
			.catch((e) => {
				console.error(e);
				setError(e instanceof Error ? e.message : String(e));
			})
			.finally(() => setIsLoading(false));
	}, [path, config, contentTypeId, filename]);

	useEffect(() => {
		frontMatterRef.current = frontMatter;
	}, [frontMatter]);

	const handleContentChange = useCallback((newContent: string) => {
		contentRef.current = newContent;
		setIsDirty(true);
	}, []);

	const handleFrontMatterChange = useCallback((field: string, value: unknown) => {
		setFrontMatter((prev) => ({ ...prev, [field]: value }));
		setIsDirty(true);
	}, []);

	const startRename = () => {
		if (!file) return;
		const nameWithoutExt = file.filename.replace(/\.md$/, "");
		setRenameValue(nameWithoutExt);
		setRenameError("");
		setIsRenaming(true);
		setTimeout(() => renameInputRef.current?.select(), 0);
	};

	const cancelRename = () => {
		setIsRenaming(false);
		setRenameValue("");
		setRenameError("");
	};

	const submitRename = async () => {
		if (!file || !path || !config || !contentTypeId) return;

		const trimmed = renameValue.trim();
		if (!trimmed || /[/\\:*?"<>|]/.test(trimmed)) {
			setRenameError(t.invalidFileName);
			return;
		}

		const newFilename = trimmed.endsWith(".md") ? trimmed : `${trimmed}.md`;

		if (newFilename === file.filename) {
			cancelRename();
			return;
		}

		const existingFiles = await listFiles(path, contentTypeId, config);
		if (existingFiles.some((f) => f.filename === newFilename)) {
			setRenameError(t.fileAlreadyExists);
			return;
		}

		const filePath = `${path}/${file.relativePath}`;
		const dir = filePath.substring(0, filePath.lastIndexOf("/") + 1);
		const newPath = dir + newFilename;

		try {
			await renameFile(path, filePath, newPath);
			setIsRenaming(false);
			setRenameValue("");
			setRenameError("");
			navigate(`/content/${contentTypeId}/${encodeURIComponent(newFilename)}`, {
				replace: true,
			});
		} catch (e) {
			console.error(e);
			setRenameError(t.errorOccurred);
		}
	};

	const handleSave = useCallback(async () => {
		if (!file || !path) return;
		setIsSaving(true);
		try {
			const now = new Date();
			const pad = (n: number) => String(n).padStart(2, "0");
			const updatedAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
			const updatedFm = { ...frontMatterRef.current, updatedAt };
			await writeFile(path, `${path}/${file.relativePath}`, updatedFm, contentRef.current);
			frontMatterRef.current = updatedFm;
			setFrontMatter(updatedFm);
			setIsDirty(false);
		} catch (e) {
			console.error(e);
		} finally {
			setIsSaving(false);
		}
	}, [file, path]);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "s") {
				e.preventDefault();
				handleSave();
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [handleSave]);

	if (isLoading) {
		return (
			<div className="editor-page">
				<p className="editor-loading">{t.loading}</p>
			</div>
		);
	}

	if (error || !file || !contentType) {
		return (
			<div className="editor-page">
				<div className="editor-error">
					<p className="editor-error-message">{error || t.contentTypeNotFound}</p>
					<div className="editor-error-actions">
						<button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
							{t.goBack}
						</button>
						<button type="button" className="btn-secondary" onClick={() => navigate("/")}>
							{t.backToHome}
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="editor-page">
			<div className="editor-toolbar">
				<div className="editor-toolbar-left">
					<button
						type="button"
						className="editor-back-btn"
						onClick={() => navigate(`/content/${contentTypeId}`)}
						title={t.goBack}
					>
						&larr;
					</button>
					{isRenaming ? (
						<div className="editor-rename">
							<div className="editor-rename-input-row">
								<input
									ref={renameInputRef}
									type="text"
									className="editor-rename-input"
									value={renameValue}
									onChange={(e) => {
										setRenameValue(e.target.value);
										setRenameError("");
									}}
									onKeyDown={(e) => {
										if (e.key === "Enter") submitRename();
										if (e.key === "Escape") cancelRename();
									}}
									onBlur={() => cancelRename()}
								/>
								<span className="editor-rename-ext">.md</span>
							</div>
							{renameError && <span className="editor-rename-error">{renameError}</span>}
						</div>
					) : (
						<button
							type="button"
							className="editor-filename"
							onClick={startRename}
							title={t.renameFile}
						>
							{file.filename}
						</button>
					)}
				</div>
				<div className="editor-toolbar-actions">
					{typeof frontMatter.updatedAt === "string" && (
						<span className="editor-updated-at">
							{t.lastUpdated}: {frontMatter.updatedAt.replace("T", " ")}
						</span>
					)}
					{isDirty && <span className="editor-unsaved">{t.unsavedChanges}</span>}
					<button
						type="button"
						className="btn-primary"
						onClick={handleSave}
						disabled={isSaving || !isDirty}
					>
						{isSaving ? t.saving : t.save}
					</button>
				</div>
			</div>

			<div className="editor-frontmatter">
				<h3 className="editor-section-title">{t.frontMatter}</h3>
				<div className="editor-fm-fields">
					{contentType.frontMatter.fields.map((field) => (
						<div key={field.name} className="editor-fm-field">
							<label className="editor-fm-label" htmlFor={`fm-field-${field.name}`}>
								{field.name}
								{field.required && <span className="editor-fm-required">*</span>}
							</label>
							{field.type === "boolean" ? (
								<input
									id={`fm-field-${field.name}`}
									type="checkbox"
									checked={!!frontMatter[field.name]}
									onChange={(e) => handleFrontMatterChange(field.name, e.target.checked)}
								/>
							) : field.type === "text" ? (
								<textarea
									id={`fm-field-${field.name}`}
									value={String(frontMatter[field.name] ?? "")}
									onChange={(e) => handleFrontMatterChange(field.name, e.target.value)}
									rows={3}
								/>
							) : field.type === "select" ? (
								<select
									id={`fm-field-${field.name}`}
									value={String(frontMatter[field.name] ?? "")}
									onChange={(e) => handleFrontMatterChange(field.name, e.target.value)}
								>
									<option value="">--</option>
									{field.options?.map((opt) => (
										<option key={opt} value={opt}>
											{opt}
										</option>
									))}
								</select>
							) : field.type === "string[]" ? (
								<input
									id={`fm-field-${field.name}`}
									type="text"
									value={
										Array.isArray(frontMatter[field.name])
											? (frontMatter[field.name] as unknown[]).map(String).join(", ")
											: ""
									}
									onChange={(e) =>
										handleFrontMatterChange(
											field.name,
											e.target.value
												.split(",")
												.map((s) => s.trim())
												.filter(Boolean),
										)
									}
									placeholder={t.commaSeparatedValues}
								/>
							) : (
								<input
									id={`fm-field-${field.name}`}
									type={
										field.type === "date" ? "date" : field.type === "number" ? "number" : "text"
									}
									value={String(frontMatter[field.name] ?? "")}
									onChange={(e) =>
										handleFrontMatterChange(
											field.name,
											field.type === "number" ? Number(e.target.value) : e.target.value,
										)
									}
								/>
							)}
						</div>
					))}
				</div>
			</div>

			<div className="editor-content">
				<TiptapEditor
					content={file.content}
					placeholder={t.writeMarkdownHere}
					onChange={handleContentChange}
				/>
			</div>
		</div>
	);
}
