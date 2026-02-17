use serde::Serialize;

#[derive(Debug, thiserror::Error)]
pub enum CmsError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("YAML parse error: {0}")]
    YamlParse(String),

    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),

    #[error("Config not found at {0}")]
    ConfigNotFound(String),

    #[error("File not found: {0}")]
    FileNotFound(String),

    #[error("Content type not found: {0}")]
    ContentTypeNotFound(String),

    #[error("Invalid workspace: {0}")]
    InvalidWorkspace(String),

    #[error("Path traversal detected: {0}")]
    PathTraversal(String),

    #[error("File already exists: {0}")]
    FileAlreadyExists(String),
}

impl Serialize for CmsError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeStruct;
        let error_type = match self {
            CmsError::Io(_) => "Io",
            CmsError::YamlParse(_) => "YamlParse",
            CmsError::Json(_) => "Json",
            CmsError::ConfigNotFound(_) => "ConfigNotFound",
            CmsError::FileNotFound(_) => "FileNotFound",
            CmsError::ContentTypeNotFound(_) => "ContentTypeNotFound",
            CmsError::InvalidWorkspace(_) => "InvalidWorkspace",
            CmsError::PathTraversal(_) => "PathTraversal",
            CmsError::FileAlreadyExists(_) => "FileAlreadyExists",
        };
        let mut s = serializer.serialize_struct("CmsError", 2)?;
        s.serialize_field("type", error_type)?;
        s.serialize_field("message", &self.to_string())?;
        s.end()
    }
}

pub type CmsResult<T> = Result<T, CmsError>;
