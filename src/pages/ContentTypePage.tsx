import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createFile, deleteFile, listFiles } from "../commands/files";
import { ConfirmDialog } from "../components/shared/ConfirmDialog";
import { useLocale } from "../hooks/useLocale";
import { useWorkspace } from "../hooks/useWorkspace";
import type { MarkdownFileSummary } from "../types/content";
import "./ContentTypePage.css";

export function ContentTypePage() {
	const { contentTypeId } = useParams<{ contentTypeId: string }>();
	const { path, config } = useWorkspace();
	const { t } = useLocale();
	const navigate = useNavigate();
	const [files, setFiles] = useState<MarkdownFileSummary[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [showNewForm, setShowNewForm] = useState(false);
	const [newFileName, setNewFileName] = useState("");
	const [newFileError, setNewFileError] = useState("");
	const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const contentType = config?.contentTypes.find((ct) => ct.id === contentTypeId);

	useEffect(() => {
		if (!path || !config || !contentTypeId) return;

		setIsLoading(true);
		setError(null);
		listFiles(path, contentTypeId, config)
			.then(setFiles)
			.catch((e) => {
				console.error("Failed to list files:", e);
				setError(String(e));
			})
			.finally(() => setIsLoading(false));
	}, [path, config, contentTypeId]);

	useEffect(() => {
		if (showNewForm) {
			inputRef.current?.focus();
		}
	}, [showNewForm]);

	const handleOpenNewForm = () => {
		setNewFileName("");
		setNewFileError("");
		setShowNewForm(true);
	};

	const handleCancelNewForm = () => {
		setShowNewForm(false);
		setNewFileName("");
		setNewFileError("");
	};

	const handleSubmitNewFile = async () => {
		if (!path || !config || !contentTypeId || !contentType) return;

		const trimmed = newFileName.trim();
		if (!trimmed || /[/\\:*?"<>|]/.test(trimmed)) {
			setNewFileError(t.invalidFileName);
			return;
		}

		const filename = trimmed.endsWith(".md") ? trimmed : `${trimmed}.md`;

		if (files.some((f) => f.filename === filename)) {
			setNewFileError(t.fileAlreadyExists);
			return;
		}

		const now = new Date().toISOString().split("T")[0];
		const defaultFm: Record<string, unknown> = {};
		for (const field of contentType.frontMatter.fields) {
			if (field.default === "{{now}}") {
				defaultFm[field.name] = now;
			} else {
				defaultFm[field.name] = field.default;
			}
		}

		try {
			await createFile(path, contentTypeId, filename, defaultFm, "\n", config);
			const updated = await listFiles(path, contentTypeId, config);
			setFiles(updated);
			setShowNewForm(false);
			setNewFileName("");
			setNewFileError("");
		} catch (e) {
			console.error("Failed to create file:", e);
			setNewFileError(t.errorOccurred);
		}
	};

	const handleDeleteFile = async () => {
		if (!path || !config || !contentTypeId || !deleteTarget) return;
		try {
			await deleteFile(path, `${path}/${deleteTarget}`);
			const updated = await listFiles(path, contentTypeId, config);
			setFiles(updated);
		} catch (e) {
			console.error("Failed to delete file:", e);
			setError(t.errorOccurred);
		} finally {
			setDeleteTarget(null);
		}
	};

	if (!contentType) {
		return (
			<div className="content-type-page">
				<div className="content-type-empty">
					<p>{t.contentTypeNotFound}</p>
					<div className="content-type-error-actions">
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
		<div className="content-type-page">
			<div className="content-type-header">
				<h1>{contentType.name}</h1>
				<button type="button" className="btn-primary" onClick={handleOpenNewForm}>
					+ {t.newFile}
				</button>
			</div>

			{error && <p className="content-type-error">{error}</p>}

			{showNewForm && (
				<div className="new-file-form">
					<div className="new-file-input-row">
						<input
							ref={inputRef}
							type="text"
							className="new-file-input"
							value={newFileName}
							onChange={(e) => {
								setNewFileName(e.target.value);
								setNewFileError("");
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter") handleSubmitNewFile();
								if (e.key === "Escape") handleCancelNewForm();
							}}
							placeholder={t.enterFileName}
						/>
						<span className="new-file-ext">.md</span>
					</div>
					{newFileError && <p className="new-file-error">{newFileError}</p>}
					<div className="new-file-actions">
						<button type="button" className="btn-primary" onClick={handleSubmitNewFile}>
							{t.create}
						</button>
						<button type="button" className="btn-secondary" onClick={handleCancelNewForm}>
							{t.cancel}
						</button>
					</div>
				</div>
			)}

			{isLoading ? (
				<p className="content-type-loading">{t.loading}</p>
			) : files.length === 0 && !showNewForm ? (
				<div className="content-type-empty">
					<p>{t.noFilesYet}</p>
				</div>
			) : (
				<ul className="file-list">
					{files.map((file) => (
						<li key={file.relativePath} className="file-list-item">
							<button
								type="button"
								className="file-list-item-main"
								onClick={() =>
									navigate(`/content/${contentTypeId}/${encodeURIComponent(file.filename)}`)
								}
							>
								<span className="file-list-title">
									{String(file.frontMatter.title ?? "") || file.filename}
								</span>
								<span className="file-list-meta">
									{String(file.frontMatter.date ?? "") || file.modifiedAt.split("T")[0]}
								</span>
							</button>
							<button
								type="button"
								className="file-list-delete"
								onClick={() => setDeleteTarget(file.relativePath)}
								title={t.deleteFile}
							>
								&times;
							</button>
						</li>
					))}
				</ul>
			)}
			{deleteTarget && (
				<ConfirmDialog
					message={t.confirmDeleteFile}
					variant="danger"
					confirmLabel={t.delete}
					onConfirm={handleDeleteFile}
					onCancel={() => setDeleteTarget(null)}
				/>
			)}
		</div>
	);
}
