use std::path::{Path, PathBuf};

use walkdir::WalkDir;

use crate::errors::{CmsError, CmsResult};
use crate::models::content_type::SortOrder;
use crate::models::markdown_file::{MarkdownFileContent, MarkdownFileMeta};
use crate::models::workspace::WorkspaceConfig;

/// Validate that a resolved path is within the workspace directory.
fn validate_within_workspace(workspace_path: &str, target_path: &Path) -> CmsResult<PathBuf> {
    let workspace = std::fs::canonicalize(workspace_path)
        .map_err(|_| CmsError::InvalidWorkspace(format!("Workspace not found: {}", workspace_path)))?;

    let resolved = if target_path.exists() {
        std::fs::canonicalize(target_path)?
    } else {
        // For new files that don't exist yet, canonicalize the parent directory
        let parent = target_path
            .parent()
            .ok_or_else(|| CmsError::InvalidWorkspace("Invalid path".to_string()))?;
        let canonical_parent = std::fs::canonicalize(parent)
            .map_err(|_| CmsError::InvalidWorkspace("Parent directory not found".to_string()))?;
        canonical_parent.join(target_path.file_name().unwrap_or_default())
    };

    if !resolved.starts_with(&workspace) {
        return Err(CmsError::PathTraversal(
            "Path is outside workspace".to_string(),
        ));
    }
    Ok(resolved)
}

/// Validate that a filename does not contain path separators or traversal sequences.
fn validate_filename(filename: &str) -> CmsResult<()> {
    if filename.contains('/')
        || filename.contains('\\')
        || filename.contains("..")
        || filename.is_empty()
    {
        return Err(CmsError::InvalidWorkspace(format!(
            "Invalid filename: {}",
            filename
        )));
    }
    Ok(())
}

/// Split a markdown file into front matter (YAML) and body content.
///
/// Expects the format:
/// ```text
/// ---
/// key: value
/// ---
/// body content
/// ```
fn parse_front_matter(raw: &str) -> (serde_json::Value, String) {
    let empty_fm = || serde_json::Value::Object(serde_json::Map::new());
    // Normalize CRLF to LF for cross-platform compatibility
    let raw = &raw.replace("\r\n", "\n");
    let delimiter = "---";
    let closing = "\n---";

    if !raw.starts_with(delimiter) {
        return (empty_fm(), raw.to_string());
    }

    let after_opening = &raw[delimiter.len()..];
    if let Some(end) = after_opening.find(closing) {
        let yaml_str = after_opening[..end].trim();
        let body = &after_opening[end + closing.len()..];
        let body = body.strip_prefix('\n').unwrap_or(body);

        match serde_yml::from_str::<serde_json::Value>(yaml_str) {
            Ok(value) => (value, body.to_string()),
            Err(e) => {
                eprintln!("Warning: Failed to parse front matter YAML: {}", e);
                (empty_fm(), raw.to_string())
            }
        }
    } else {
        (empty_fm(), raw.to_string())
    }
}

/// Serialize front matter and content back into a markdown file string.
fn serialize_file(front_matter: &serde_json::Value, content: &str) -> CmsResult<String> {
    let yaml = serde_yml::to_string(front_matter)
        .map_err(|e| CmsError::YamlParse(e.to_string()))?;
    Ok(format!("---\n{}---\n{}", yaml, content))
}

fn get_modified_time(path: &Path) -> String {
    path.metadata()
        .and_then(|m| m.modified())
        .ok()
        .map(|t| {
            let dt: chrono::DateTime<chrono::Local> = t.into();
            dt.format("%Y-%m-%dT%H:%M:%S").to_string()
        })
        .unwrap_or_default()
}

#[tauri::command]
pub async fn list_files(
    workspace_path: String,
    content_type_id: String,
    config: WorkspaceConfig,
) -> CmsResult<Vec<MarkdownFileMeta>> {
    let ct = config
        .content_types
        .iter()
        .find(|c| c.id == content_type_id)
        .ok_or_else(|| CmsError::ContentTypeNotFound(content_type_id.clone()))?;

    let folder = Path::new(&workspace_path).join(&ct.folder);
    validate_within_workspace(&workspace_path, &folder)?;

    if !folder.exists() {
        return Ok(Vec::new());
    }

    let sort_field = ct.sort_field.clone();
    let sort_desc = ct.sort_order == SortOrder::Desc;
    let ct_folder = ct.folder.clone();

    let mut files = tokio::task::spawn_blocking(move || -> CmsResult<Vec<MarkdownFileMeta>> {
        let mut files = Vec::new();

        for entry in WalkDir::new(&folder)
            .max_depth(1)
            .into_iter()
            .filter_map(|e| e.ok())
        {
            let path = entry.path();
            if path.is_file() && path.extension().map_or(false, |ext| ext == "md") {
                let raw = std::fs::read_to_string(path)?;
                let (front_matter, _) = parse_front_matter(&raw);
                let filename = path
                    .file_name()
                    .map(|n| n.to_string_lossy().to_string())
                    .unwrap_or_default();
                let relative_path = Path::new(&ct_folder)
                    .join(&filename)
                    .to_string_lossy()
                    .to_string();

                files.push(MarkdownFileMeta {
                    relative_path,
                    filename,
                    front_matter,
                    modified_at: get_modified_time(path),
                });
            }
        }

        Ok(files)
    })
    .await
    .map_err(|e| CmsError::Io(std::io::Error::new(std::io::ErrorKind::Other, e)))??;

    files.sort_by(|a, b| {
        let va = a.front_matter.get(&sort_field);
        let vb = b.front_matter.get(&sort_field);
        let ordering = match (va, vb) {
            (Some(a_val), Some(b_val)) if a_val.is_number() && b_val.is_number() => {
                a_val.as_f64().partial_cmp(&b_val.as_f64()).unwrap_or(std::cmp::Ordering::Equal)
            }
            _ => {
                let sa = va.and_then(|v| v.as_str()).unwrap_or("");
                let sb = vb.and_then(|v| v.as_str()).unwrap_or("");
                sa.cmp(sb)
            }
        };
        if sort_desc {
            ordering.reverse()
        } else {
            ordering
        }
    });

    Ok(files)
}

#[tauri::command]
pub async fn read_file(workspace_path: String, file_path: String) -> CmsResult<MarkdownFileContent> {
    let path = Path::new(&file_path);
    validate_within_workspace(&workspace_path, path)?;

    if !path.exists() {
        return Err(CmsError::FileNotFound(file_path));
    }

    let raw_content = tokio::fs::read_to_string(path).await?;
    let (front_matter, content) = parse_front_matter(&raw_content);

    let workspace = Path::new(&workspace_path);
    let relative_path = path
        .strip_prefix(workspace)
        .unwrap_or(path)
        .to_string_lossy()
        .to_string();

    Ok(MarkdownFileContent {
        relative_path,
        filename: path
            .file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_default(),
        front_matter,
        content,
        raw_content,
        modified_at: get_modified_time(path),
    })
}

#[tauri::command]
pub async fn write_file(
    workspace_path: String,
    file_path: String,
    front_matter: serde_json::Value,
    content: String,
) -> CmsResult<()> {
    let path = Path::new(&file_path);
    validate_within_workspace(&workspace_path, path)?;

    let output = serialize_file(&front_matter, &content)?;
    tokio::fs::write(&file_path, output).await?;
    Ok(())
}

#[tauri::command]
pub async fn create_file(
    workspace_path: String,
    content_type_id: String,
    filename: String,
    front_matter: serde_json::Value,
    content: String,
    config: WorkspaceConfig,
) -> CmsResult<String> {
    let ct = config
        .content_types
        .iter()
        .find(|c| c.id == content_type_id)
        .ok_or_else(|| CmsError::ContentTypeNotFound(content_type_id.clone()))?;

    validate_filename(&filename)?;
    let folder = Path::new(&workspace_path).join(&ct.folder);
    validate_within_workspace(&workspace_path, &folder)?;
    tokio::fs::create_dir_all(&folder).await?;

    let file_path = folder.join(&filename);
    if file_path.exists() {
        return Err(CmsError::FileAlreadyExists(filename));
    }
    let output = serialize_file(&front_matter, &content)?;
    tokio::fs::write(&file_path, output).await?;

    Ok(file_path.to_string_lossy().to_string())
}

#[tauri::command]
pub async fn delete_file(workspace_path: String, file_path: String) -> CmsResult<()> {
    let path = Path::new(&file_path);
    validate_within_workspace(&workspace_path, path)?;

    if !path.exists() {
        return Err(CmsError::FileNotFound(file_path));
    }
    tokio::fs::remove_file(path).await?;
    Ok(())
}

#[tauri::command]
pub async fn rename_file(
    workspace_path: String,
    old_path: String,
    new_path: String,
) -> CmsResult<()> {
    let old = Path::new(&old_path);
    validate_within_workspace(&workspace_path, old)?;

    let new = Path::new(&new_path);
    if let Some(new_filename) = new.file_name().and_then(|n| n.to_str()) {
        validate_filename(new_filename)?;
    }
    validate_within_workspace(&workspace_path, new)?;

    if !old.exists() {
        return Err(CmsError::FileNotFound(old_path));
    }
    if new.exists() {
        return Err(CmsError::FileAlreadyExists(new_path));
    }
    tokio::fs::rename(old, &new_path).await?;
    Ok(())
}

#[tauri::command]
pub async fn read_file_by_name(
    workspace_path: String,
    content_type_id: String,
    filename: String,
    config: WorkspaceConfig,
) -> CmsResult<MarkdownFileContent> {
    let ct = config
        .content_types
        .iter()
        .find(|c| c.id == content_type_id)
        .ok_or_else(|| CmsError::ContentTypeNotFound(content_type_id))?;

    validate_filename(&filename)?;
    let folder = Path::new(&workspace_path).join(&ct.folder);
    let file_path = folder.join(&filename);
    validate_within_workspace(&workspace_path, &file_path)?;

    if !file_path.exists() {
        return Err(CmsError::FileNotFound(filename));
    }

    let raw_content = tokio::fs::read_to_string(&file_path).await?;
    let (front_matter, content) = parse_front_matter(&raw_content);

    let relative_path = Path::new(&ct.folder)
        .join(&filename)
        .to_string_lossy()
        .to_string();

    Ok(MarkdownFileContent {
        relative_path,
        filename,
        front_matter,
        content,
        raw_content,
        modified_at: get_modified_time(&file_path),
    })
}
