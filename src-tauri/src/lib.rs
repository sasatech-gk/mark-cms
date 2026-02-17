mod commands;
mod errors;
mod models;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            commands::workspace::open_workspace,
            commands::workspace::init_workspace,
            commands::workspace::get_registered_workspaces,
            commands::workspace::register_workspace,
            commands::workspace::unregister_workspace,
            commands::workspace::migrate_recent_to_registered,
            commands::config::read_config,
            commands::config::write_config,
            commands::files::list_files,
            commands::files::read_file,
            commands::files::write_file,
            commands::files::create_file,
            commands::files::delete_file,
            commands::files::rename_file,
            commands::files::read_file_by_name,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
