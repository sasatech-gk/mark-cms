use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum FieldType {
    String,
    Text,
    Number,
    Boolean,
    Date,
    Datetime,
    Select,
    #[serde(rename = "string[]")]
    StringArray,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FrontMatterFieldDef {
    pub name: String,
    #[serde(rename = "type")]
    pub field_type: FieldType,
    pub required: bool,
    pub default: serde_json::Value,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub options: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FrontMatterSchema {
    pub fields: Vec<FrontMatterFieldDef>,
}

fn default_sort_field() -> String {
    "date".to_string()
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SortOrder {
    Asc,
    Desc,
}

impl Default for SortOrder {
    fn default() -> Self {
        SortOrder::Desc
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ContentType {
    pub id: String,
    pub name: String,
    pub slug: String,
    pub folder: String,
    #[serde(default = "default_sort_field")]
    pub sort_field: String,
    #[serde(default)]
    pub sort_order: SortOrder,
    pub front_matter: FrontMatterSchema,
}
