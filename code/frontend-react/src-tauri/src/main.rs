// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

use commands::ai::{AppState, download_model, get_model_status, start_llama_server};

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            download_model,
            start_llama_server,
            get_model_status,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
