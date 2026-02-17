use std::path::Path;

use crate::errors::{CmsError, CmsResult};
use crate::models::workspace::{config_path, CONFIG_DIR, CONFIG_FILE, WorkspaceConfig};

#[tauri::command]
pub async fn read_config(workspace_path: String) -> CmsResult<WorkspaceConfig> {
    let config_file = config_path(&workspace_path);

    if !config_file.exists() {
        return Err(crate::errors::CmsError::ConfigNotFound(
            config_file.to_string_lossy().to_string(),
        ));
    }

    let content = tokio::fs::read_to_string(&config_file).await?;
    let config: WorkspaceConfig = serde_json::from_str(&content)?;
    Ok(config)
}

#[tauri::command]
pub async fn write_config(
    workspace_path: String,
    config: WorkspaceConfig,
) -> CmsResult<()> {
    // Validate workspace path first
    let canonical_workspace = std::fs::canonicalize(&workspace_path)
        .map_err(|_| CmsError::InvalidWorkspace(format!("Workspace not found: {}", workspace_path)))?;

    // Validate all content type folder paths BEFORE creating any directories
    for ct in &config.content_types {
        let folder = Path::new(&workspace_path).join(&ct.folder);
        // Check that the folder path, when resolved, stays within the workspace
        // For paths that don't exist yet, verify via parent directory
        if let Some(parent) = folder.parent() {
            if parent.exists() {
                let canonical_parent = std::fs::canonicalize(parent)?;
                if !canonical_parent.starts_with(&canonical_workspace) {
                    return Err(CmsError::InvalidWorkspace(
                        "Path traversal detected: content type folder is outside workspace".to_string(),
                    ));
                }
            }
        }
    }

    // All paths validated — now create directories
    let config_dir = Path::new(&workspace_path).join(CONFIG_DIR);
    tokio::fs::create_dir_all(&config_dir).await?;

    for ct in &config.content_types {
        let folder = Path::new(&workspace_path).join(&ct.folder);
        tokio::fs::create_dir_all(&folder).await?;
    }

    let config_file = config_dir.join(CONFIG_FILE);
    let content = serde_json::to_string_pretty(&config)?;
    tokio::fs::write(&config_file, content).await?;

    Ok(())
}
