import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef, useState } from "react";
import { Markdown } from "tiptap-markdown";
import { useLocale } from "../../hooks/useLocale";
import { Modal } from "../shared/Modal";
import "./TiptapEditor.css";

interface TiptapEditorProps {
	content: string;
	placeholder?: string;
	onChange: (markdown: string) => void;
}

export function TiptapEditor({ content, placeholder, onChange }: TiptapEditorProps) {
	const { t } = useLocale();
	const isExternalUpdate = useRef(false);
	const [linkDialogOpen, setLinkDialogOpen] = useState(false);
	const [linkUrl, setLinkUrl] = useState("");
	const linkInputRef = useRef<HTMLInputElement>(null);

	const editor = useEditor({
		extensions: [
			StarterKit,
			Underline,
			Link.configure({ openOnClick: false }),
			TaskList,
			TaskItem.configure({ nested: true }),
			Placeholder.configure({ placeholder: placeholder ?? "" }),
			Markdown,
		],
		content,
		onUpdate: ({ editor }) => {
			if (isExternalUpdate.current) return;
			const md = editor.storage.markdown.getMarkdown();
			onChange(md);
		},
	});

	useEffect(() => {
		if (!editor || editor.isDestroyed) return;
		const currentMd = editor.storage.markdown.getMarkdown();
		if (currentMd !== content) {
			// setContent is synchronous in TipTap, so the flag approach is safe
			isExternalUpdate.current = true;
			editor.commands.setContent(content);
			isExternalUpdate.current = false;
		}
	}, [editor, content]);

	useEffect(() => {
		if (linkDialogOpen) {
			requestAnimationFrame(() => linkInputRef.current?.select());
		}
	}, [linkDialogOpen]);

	if (!editor) return null;

	const openLinkDialog = () => {
		const prev = editor.getAttributes("link").href ?? "";
		setLinkUrl(prev);
		setLinkDialogOpen(true);
	};

	const handleLinkSubmit = () => {
		if (linkUrl.trim() === "") {
			editor.chain().focus().extendMarkRange("link").unsetLink().run();
		} else {
			try {
				const parsed = new URL(linkUrl);
				if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
					return;
				}
			} catch {
				return;
			}
			editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
		}
		setLinkDialogOpen(false);
	};

	const handleLinkRemove = () => {
		editor.chain().focus().extendMarkRange("link").unsetLink().run();
		setLinkDialogOpen(false);
	};

	return (
		<div className="tiptap-wrapper">
			<div className="tiptap-toolbar" role="toolbar" aria-label={t.toolbar}>
				<div className="tiptap-toolbar-group">
					<button
						type="button"
						className={`tiptap-btn ${editor.isActive("bold") ? "active" : ""}`}
						onClick={() => editor.chain().focus().toggleBold().run()}
						aria-label={t.bold}
					>
						<strong>B</strong>
					</button>
					<button
						type="button"
						className={`tiptap-btn ${editor.isActive("italic") ? "active" : ""}`}
						onClick={() => editor.chain().focus().toggleItalic().run()}
						aria-label={t.italic}
					>
						<em>I</em>
					</button>
					<button
						type="button"
						className={`tiptap-btn ${editor.isActive("underline") ? "active" : ""}`}
						onClick={() => editor.chain().focus().toggleUnderline().run()}
						aria-label={t.underline}
					>
						<u>U</u>
					</button>
					<button
						type="button"
						className={`tiptap-btn ${editor.isActive("strike") ? "active" : ""}`}
						onClick={() => editor.chain().focus().toggleStrike().run()}
						aria-label={t.strikethrough}
					>
						<s>S</s>
					</button>
					<button
						type="button"
						className={`tiptap-btn ${editor.isActive("code") ? "active" : ""}`}
						onClick={() => editor.chain().focus().toggleCode().run()}
						aria-label={t.inlineCode}
					>
						&lt;/&gt;
					</button>
				</div>

				<span className="tiptap-toolbar-divider" />

				<div className="tiptap-toolbar-group">
					<button
						type="button"
						className={`tiptap-btn ${editor.isActive("heading", { level: 1 }) ? "active" : ""}`}
						onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
						aria-label={t.heading1}
					>
						H1
					</button>
					<button
						type="button"
						className={`tiptap-btn ${editor.isActive("heading", { level: 2 }) ? "active" : ""}`}
						onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
						aria-label={t.heading2}
					>
						H2
					</button>
					<button
						type="button"
						className={`tiptap-btn ${editor.isActive("heading", { level: 3 }) ? "active" : ""}`}
						onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
						aria-label={t.heading3}
					>
						H3
					</button>
				</div>

				<span className="tiptap-toolbar-divider" />

				<div className="tiptap-toolbar-group">
					<button
						type="button"
						className={`tiptap-btn ${editor.isActive("bulletList") ? "active" : ""}`}
						onClick={() => editor.chain().focus().toggleBulletList().run()}
						aria-label={t.bulletList}
					>
						&#8226;
					</button>
					<button
						type="button"
						className={`tiptap-btn ${editor.isActive("orderedList") ? "active" : ""}`}
						onClick={() => editor.chain().focus().toggleOrderedList().run()}
						aria-label={t.orderedList}
					>
						1.
					</button>
					<button
						type="button"
						className={`tiptap-btn ${editor.isActive("taskList") ? "active" : ""}`}
						onClick={() => editor.chain().focus().toggleTaskList().run()}
						aria-label={t.taskList}
					>
						&#9745;
					</button>
				</div>

				<span className="tiptap-toolbar-divider" />

				<div className="tiptap-toolbar-group">
					<button
						type="button"
						className={`tiptap-btn ${editor.isActive("blockquote") ? "active" : ""}`}
						onClick={() => editor.chain().focus().toggleBlockquote().run()}
						aria-label={t.blockquote}
					>
						&#8220;
					</button>
					<button
						type="button"
						className={`tiptap-btn ${editor.isActive("codeBlock") ? "active" : ""}`}
						onClick={() => editor.chain().focus().toggleCodeBlock().run()}
						aria-label={t.codeBlock}
					>
						&#123;&#125;
					</button>
					<button
						type="button"
						className="tiptap-btn"
						onClick={() => editor.chain().focus().setHorizontalRule().run()}
						aria-label={t.horizontalRule}
					>
						&#8212;
					</button>
				</div>

				<span className="tiptap-toolbar-divider" />

				<div className="tiptap-toolbar-group">
					<button
						type="button"
						className={`tiptap-btn ${editor.isActive("link") ? "active" : ""}`}
						onClick={openLinkDialog}
						aria-label={t.link}
					>
						&#128279;
					</button>
				</div>

				<div className="tiptap-toolbar-spacer" />

				<div className="tiptap-toolbar-group">
					<button
						type="button"
						className="tiptap-btn"
						onClick={() => editor.chain().focus().undo().run()}
						disabled={!editor.can().undo()}
						aria-label={t.undo}
					>
						&#8630;
					</button>
					<button
						type="button"
						className="tiptap-btn"
						onClick={() => editor.chain().focus().redo().run()}
						disabled={!editor.can().redo()}
						aria-label={t.redo}
					>
						&#8631;
					</button>
				</div>
			</div>

			<div className="tiptap-content">
				<EditorContent editor={editor} />
			</div>

			{linkDialogOpen && (
				<Modal onClose={() => setLinkDialogOpen(false)} ariaLabel={t.link} maxWidth={400}>
					<div className="tiptap-link-dialog">
						<h3 className="tiptap-link-dialog-title">{t.link}</h3>
						<input
							ref={linkInputRef}
							type="url"
							className="tiptap-link-dialog-input"
							value={linkUrl}
							onChange={(e) => setLinkUrl(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") handleLinkSubmit();
							}}
							placeholder={t.enterUrl}
						/>
						<div className="tiptap-link-dialog-actions">
							{editor.isActive("link") && (
								<button type="button" className="btn-secondary" onClick={handleLinkRemove}>
									{t.removeLink}
								</button>
							)}
							<div className="tiptap-link-dialog-spacer" />
							<button
								type="button"
								className="btn-secondary"
								onClick={() => setLinkDialogOpen(false)}
							>
								{t.cancel}
							</button>
							<button type="button" className="btn-primary" onClick={handleLinkSubmit}>
								{t.apply}
							</button>
						</div>
					</div>
				</Modal>
			)}
		</div>
	);
}
