use std::path::Path;

use chrono::Utc;
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

use crate::errors::{CmsError, CmsResult};
use crate::models::workspace::{
    config_path, CONFIG_DIR, CONFIG_FILE, RegisteredWorkspace, WorkspaceConfig,
};

const RECENT_WORKSPACES_KEY: &str = "recent_workspaces";
const REGISTERED_WORKSPACES_KEY: &str = "registered_workspaces";

async fn read_workspace_name(path: &str) -> String {
    let config_file = config_path(path);
    match tokio::fs::read_to_string(&config_file).await {
        Ok(content) => serde_json::from_str::<WorkspaceConfig>(&content)
            .ok()
            .map(|c| c.name)
            .unwrap_or_else(|| folder_name(path)),
        Err(_) => folder_name(path),
    }
}

fn folder_name(path: &str) -> String {
    Path::new(path)
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| "Untitled".to_string())
}

#[tauri::command]
pub async fn open_workspace(path: String) -> CmsResult<WorkspaceConfig> {
    let metadata = tokio::fs::metadata(&path).await;
    if !metadata.map(|m| m.is_dir()).unwrap_or(false) {
        return Err(CmsError::InvalidWorkspace(format!(
            "Directory not found: {}",
            path
        )));
    }

    let config_file = config_path(&path);

    if tokio::fs::try_exists(&config_file).await.unwrap_or(false) {
        let content = tokio::fs::read_to_string(&config_file).await?;
        let config: WorkspaceConfig = serde_json::from_str(&content)?;
        Ok(config)
    } else {
        Ok(WorkspaceConfig {
            name: Path::new(&path)
                .file_name()
                .map(|n| n.to_string_lossy().to_string())
                .unwrap_or_else(|| "Untitled".to_string()),
            ..WorkspaceConfig::default()
        })
    }
}

#[tauri::command]
pub async fn init_workspace(path: String, name: String) -> CmsResult<WorkspaceConfig> {
    let config_dir = Path::new(&path).join(CONFIG_DIR);
    tokio::fs::create_dir_all(&config_dir).await?;

    let config = WorkspaceConfig {
        version: 1,
        name,
        content_types: Vec::new(),
    };

    let config_file = config_dir.join(CONFIG_FILE);
    let content = serde_json::to_string_pretty(&config)?;
    tokio::fs::write(&config_file, content).await?;

    Ok(config)
}

#[tauri::command]
pub async fn get_registered_workspaces(app: AppHandle) -> CmsResult<Vec<RegisteredWorkspace>> {
    let store = app
        .store("settings.json")
        .map_err(|e| CmsError::InvalidWorkspace(e.to_string()))?;

    let workspaces = store
        .get(REGISTERED_WORKSPACES_KEY)
        .and_then(|v| serde_json::from_value::<Vec<RegisteredWorkspace>>(v).ok())
        .unwrap_or_default();

    Ok(workspaces)
}

#[tauri::command]
pub async fn register_workspace(
    app: AppHandle,
    path: String,
) -> CmsResult<RegisteredWorkspace> {
    let name = read_workspace_name(&path).await;

    let store = app
        .store("settings.json")
        .map_err(|e| CmsError::InvalidWorkspace(e.to_string()))?;

    let mut workspaces = store
        .get(REGISTERED_WORKSPACES_KEY)
        .and_then(|v| serde_json::from_value::<Vec<RegisteredWorkspace>>(v).ok())
        .unwrap_or_default();

    // Remove existing entry if re-registering (idempotent)
    workspaces.retain(|w| w.path != path);

    let workspace = RegisteredWorkspace {
        path: path.clone(),
        name,
        registered_at: Utc::now(),
    };

    // Prepend (most recently registered first)
    workspaces.insert(0, workspace.clone());

    store.set(
        REGISTERED_WORKSPACES_KEY,
        serde_json::to_value(&workspaces)?,
    );

    Ok(workspace)
}

#[tauri::command]
pub async fn unregister_workspace(app: AppHandle, path: String) -> CmsResult<()> {
    let store = app
        .store("settings.json")
        .map_err(|e| CmsError::InvalidWorkspace(e.to_string()))?;

    let mut workspaces = store
        .get(REGISTERED_WORKSPACES_KEY)
        .and_then(|v| serde_json::from_value::<Vec<RegisteredWorkspace>>(v).ok())
        .unwrap_or_default();

    workspaces.retain(|w| w.path != path);

    store.set(
        REGISTERED_WORKSPACES_KEY,
        serde_json::to_value(&workspaces)?,
    );

    Ok(())
}

#[tauri::command]
pub async fn migrate_recent_to_registered(app: AppHandle) -> CmsResult<bool> {
    let store = app
        .store("settings.json")
        .map_err(|e| CmsError::InvalidWorkspace(e.to_string()))?;

    let old_recent = store
        .get(RECENT_WORKSPACES_KEY)
        .and_then(|v| serde_json::from_value::<Vec<String>>(v).ok())
        .unwrap_or_default();

    let existing = store
        .get(REGISTERED_WORKSPACES_KEY)
        .and_then(|v| serde_json::from_value::<Vec<RegisteredWorkspace>>(v).ok())
        .unwrap_or_default();

    if old_recent.is_empty() || !existing.is_empty() {
        return Ok(false);
    }

    let now = Utc::now();
    let mut migrated = Vec::with_capacity(old_recent.len());
    for (i, path) in old_recent.into_iter().enumerate() {
        let name = read_workspace_name(&path).await;
        migrated.push(RegisteredWorkspace {
            path,
            name,
            registered_at: now - chrono::Duration::seconds(i as i64),
        });
    }

    store.set(
        REGISTERED_WORKSPACES_KEY,
        serde_json::to_value(&migrated)?,
    );

    store.delete(RECENT_WORKSPACES_KEY);

    Ok(true)
}
