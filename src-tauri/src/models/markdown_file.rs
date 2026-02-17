use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MarkdownFileMeta {
    pub relative_path: String,
    pub filename: String,
    pub front_matter: serde_json::Value,
    pub modified_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MarkdownFileContent {
    pub relative_path: String,
    pub filename: String,
    pub front_matter: serde_json::Value,
    pub content: String,
    pub raw_content: String,
    pub modified_at: String,
}
