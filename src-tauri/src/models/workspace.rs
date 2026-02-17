use std::path::{Path, PathBuf};

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use super::content_type::ContentType;

pub const CONFIG_DIR: &str = ".markcms";
pub const CONFIG_FILE: &str = "config.json";

pub fn config_path(workspace_path: &str) -> PathBuf {
    Path::new(workspace_path).join(CONFIG_DIR).join(CONFIG_FILE)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkspaceConfig {
    pub version: u32,
    pub name: String,
    pub content_types: Vec<ContentType>,
}

impl Default for WorkspaceConfig {
    fn default() -> Self {
        Self {
            version: 1,
            name: "Untitled Workspace".to_string(),
            content_types: Vec::new(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RegisteredWorkspace {
    pub path: String,
    pub name: String,
    pub registered_at: DateTime<Utc>,
}
