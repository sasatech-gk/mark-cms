import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ConfirmDialog } from "../components/shared/ConfirmDialog";
import { Modal } from "../components/shared/Modal";
import { useLocale } from "../hooks/useLocale";
import { useWorkspace } from "../hooks/useWorkspace";
import type { ContentType, FrontMatterFieldDef } from "../types/content";
import "./ContentTypeEditPage.css";

function generateId(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

const DEFAULT_FIELD: FrontMatterFieldDef = {
	name: "",
	type: "string",
	required: false,
	default: "",
};

export function ContentTypeEditPage() {
	const { contentTypeId } = useParams<{ contentTypeId: string }>();
	const { config, updateConfig } = useWorkspace();
	const { t } = useLocale();
	const navigate = useNavigate();

	if (!config) return null;

	const isNew = !contentTypeId;
	const existing = contentTypeId ? config.contentTypes.find((c) => c.id === contentTypeId) : null;

	if (!isNew && !existing) {
		return (
			<div className="ct-edit-page">
				<div className="ct-edit-error">
					<p>{t.contentTypeNotFound}</p>
					<button type="button" className="btn-secondary" onClick={() => navigate("/settings")}>
						{t.goBack}
					</button>
				</div>
			</div>
		);
	}

	const initial: ContentType = existing ?? {
		id: "",
		name: "",
		slug: "",
		folder: "",
		sortField: "date",
		sortOrder: "desc",
		frontMatter: {
			fields: [
				{ name: "title", type: "string", required: true, default: "" },
				{ name: "date", type: "date", required: true, default: "{{now}}" },
			],
		},
	};

	const handleSave = async (ct: ContentType) => {
		const idx = config.contentTypes.findIndex((c) => c.id === ct.id);
		const types =
			idx >= 0
				? config.contentTypes.map((c) => (c.id === ct.id ? ct : c))
				: [...config.contentTypes, ct];
		await updateConfig({ ...config, contentTypes: types });
		navigate("/settings");
	};

	return (
		<ContentTypeForm
			initial={initial}
			isNew={isNew}
			existingIds={config.contentTypes.map((c) => c.id)}
			onSave={handleSave}
			onCancel={() => navigate("/settings")}
		/>
	);
}

function ContentTypeForm({
	initial,
	isNew,
	existingIds,
	onSave,
	onCancel,
}: {
	initial: ContentType;
	isNew: boolean;
	existingIds: string[];
	onSave: (ct: ContentType) => Promise<void>;
	onCancel: () => void;
}) {
	const { t } = useLocale();
	const [ct, setCt] = useState<ContentType>(initial);
	const [formError, setFormError] = useState("");
	const [editingOptionsIndex, setEditingOptionsIndex] = useState<number | null>(null);
	const [removeFieldIndex, setRemoveFieldIndex] = useState<number | null>(null);

	const updateField = (key: keyof ContentType, value: string) => {
		if (key === "name") setFormError("");
		setCt((prev) => {
			const updated = { ...prev, [key]: value };
			if (key === "name" && isNew) {
				const id = generateId(value);
				updated.id = id;
				updated.slug = id;
				updated.folder = `content/${id}`;
			}
			return updated;
		});
	};

	const addField = () => {
		setCt((prev) => ({
			...prev,
			frontMatter: {
				fields: [...prev.frontMatter.fields, { ...DEFAULT_FIELD }],
			},
		}));
	};

	const updateFmField = (index: number, key: keyof FrontMatterFieldDef, value: unknown) => {
		setCt((prev) => ({
			...prev,
			frontMatter: {
				fields: prev.frontMatter.fields.map((f, i) => (i === index ? { ...f, [key]: value } : f)),
			},
		}));
	};

	const removeFmField = (index: number) => {
		setCt((prev) => ({
			...prev,
			frontMatter: {
				fields: prev.frontMatter.fields.filter((_, i) => i !== index),
			},
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isNew && existingIds.includes(ct.id)) {
			setFormError(t.contentTypeAlreadyExists);
			return;
		}
		try {
			await onSave(ct);
		} catch (err) {
			console.error("Failed to save content type:", err);
			setFormError(String(err));
		}
	};

	return (
		<div className="ct-edit-page">
			<div className="ct-edit-toolbar">
				<button type="button" className="ct-edit-back-btn" onClick={onCancel}>
					&larr;
				</button>
				<h1>{isNew ? t.newContentType : `${t.editContentType}: ${ct.name}`}</h1>
			</div>

			<form className="ct-form" onSubmit={handleSubmit}>
				<div className="ct-form-grid">
					<label className="ct-form-field">
						<span>{t.name}</span>
						<input
							type="text"
							value={ct.name}
							onChange={(e) => updateField("name", e.target.value)}
							required
						/>
					</label>
					<label className="ct-form-field">
						<span>{t.folder}</span>
						<input
							type="text"
							value={ct.folder}
							onChange={(e) => updateField("folder", e.target.value)}
							required
						/>
					</label>
					<label className="ct-form-field">
						<span>{t.sortField}</span>
						<input
							type="text"
							value={ct.sortField}
							onChange={(e) => updateField("sortField", e.target.value)}
						/>
					</label>
					<label className="ct-form-field">
						<span>{t.sortOrder}</span>
						<select value={ct.sortOrder} onChange={(e) => updateField("sortOrder", e.target.value)}>
							<option value="desc">{t.descending}</option>
							<option value="asc">{t.ascending}</option>
						</select>
					</label>
				</div>

				<div className="ct-form-fields-section">
					<div className="ct-form-fields-header">
						<h3>{t.frontMatterFields}</h3>
						<button type="button" className="btn-secondary" onClick={addField}>
							+ {t.addField}
						</button>
					</div>

					{ct.frontMatter.fields.map((field, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: fields can have empty/duplicate names during editing
						<div key={`field-${i}`} className="ct-form-field-block">
							<div className="ct-form-field-row">
								<input
									type="text"
									placeholder={t.fieldName}
									value={field.name}
									onChange={(e) => updateFmField(i, "name", e.target.value)}
									required
								/>
								<select
									value={field.type}
									onChange={(e) => updateFmField(i, "type", e.target.value)}
								>
									<option value="string">{t.fieldTypeString}</option>
									<option value="text">{t.fieldTypeText}</option>
									<option value="number">{t.fieldTypeNumber}</option>
									<option value="boolean">{t.fieldTypeBoolean}</option>
									<option value="date">{t.fieldTypeDate}</option>
									<option value="datetime">{t.fieldTypeDatetime}</option>
									<option value="select">{t.fieldTypeSelect}</option>
									<option value="string[]">{t.fieldTypeTags}</option>
								</select>
								<label className="ct-form-checkbox">
									<input
										type="checkbox"
										checked={field.required}
										onChange={(e) => updateFmField(i, "required", e.target.checked)}
									/>
									{t.required}
								</label>
								<button
									type="button"
									className="btn-icon-danger"
									onClick={() => setRemoveFieldIndex(i)}
									title={t.removeField}
								>
									&times;
								</button>
							</div>
							{field.type === "select" && (
								<div className="ct-form-select-row">
									<span className="ct-form-select-count">
										{field.options?.length ?? 0} {t.fields}
									</span>
									<button
										type="button"
										className="btn-secondary"
										onClick={() => setEditingOptionsIndex(i)}
									>
										{t.editOptions}
									</button>
								</div>
							)}
						</div>
					))}
				</div>

				{formError && <p className="ct-form-error">{formError}</p>}

				<div className="ct-form-actions">
					<button type="submit" className="btn-primary">
						{isNew ? t.create : t.save}
					</button>
					<button type="button" className="btn-secondary" onClick={onCancel}>
						{t.cancel}
					</button>
				</div>

				{editingOptionsIndex !== null && (
					<SelectOptionsModal
						options={ct.frontMatter.fields[editingOptionsIndex]?.options ?? []}
						onSave={(options) => {
							setCt((prev) => ({
								...prev,
								frontMatter: {
									fields: prev.frontMatter.fields.map((f, i) =>
										i === editingOptionsIndex ? { ...f, options } : f,
									),
								},
							}));
							setEditingOptionsIndex(null);
						}}
						onClose={() => setEditingOptionsIndex(null)}
					/>
				)}
				{removeFieldIndex !== null && (
					<ConfirmDialog
						message={t.confirmRemoveField}
						variant="danger"
						confirmLabel={t.delete}
						onConfirm={() => {
							removeFmField(removeFieldIndex);
							setRemoveFieldIndex(null);
						}}
						onCancel={() => setRemoveFieldIndex(null)}
					/>
				)}
			</form>
		</div>
	);
}

function SelectOptionsModal({
	options: initialOptions,
	onSave,
	onClose,
}: {
	options: string[];
	onSave: (options: string[]) => void;
	onClose: () => void;
}) {
	const { t } = useLocale();
	const [options, setOptions] = useState<string[]>(initialOptions);
	const [newOption, setNewOption] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	const handleAdd = () => {
		const trimmed = newOption.trim();
		if (!trimmed || options.includes(trimmed)) return;
		setOptions((prev) => [...prev, trimmed]);
		setNewOption("");
		inputRef.current?.focus();
	};

	const handleRemove = (index: number) => {
		setOptions((prev) => prev.filter((_, i) => i !== index));
	};

	return (
		<Modal onClose={onClose} ariaLabel={t.editOptions}>
			<h3 className="select-options-title">{t.editOptions}</h3>

			{options.length === 0 && <p className="select-options-empty">{t.noOptionsYet}</p>}

			<ul className="select-options-list">
				{options.map((opt, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: options can have duplicate values during editing
					<li key={`${opt}-${i}`} className="select-options-item">
						<span>{opt}</span>
						<button type="button" className="btn-icon-danger" onClick={() => handleRemove(i)}>
							&times;
						</button>
					</li>
				))}
			</ul>

			<div className="select-options-add">
				<input
					ref={inputRef}
					type="text"
					value={newOption}
					onChange={(e) => setNewOption(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							handleAdd();
						}
					}}
					placeholder={t.optionPlaceholder}
				/>
				<button type="button" className="btn-primary" onClick={handleAdd}>
					{t.addOption}
				</button>
			</div>

			<div className="select-options-actions">
				<button type="button" className="btn-primary" onClick={() => onSave(options)}>
					{t.save}
				</button>
				<button type="button" className="btn-secondary" onClick={onClose}>
					{t.cancel}
				</button>
			</div>
		</Modal>
	);
}
