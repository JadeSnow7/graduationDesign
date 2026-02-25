use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use tauri::ipc::Channel;
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum ModelStatus {
    NotDownloaded,
    Downloading { progress: f32 },
    Ready { path: String },
    Error { message: String },
}

#[derive(Default)]
pub struct AppState {
    pub model_status: Arc<Mutex<ModelStatus>>,
    pub llama_port: Arc<Mutex<Option<u16>>>,
}

impl Default for ModelStatus {
    fn default() -> Self {
        ModelStatus::NotDownloaded
    }
}

/// Download a GGUF model from HuggingFace or any direct URL.
/// Reports progress via a Tauri channel (0.0 → 1.0).
#[tauri::command]
pub async fn download_model(
    url: String,
    progress_tx: Channel<f32>,
    state: tauri::State<'_, AppState>,
) -> Result<String, String> {
    let client = reqwest::Client::new();
    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Request failed: {e}"))?;

    let total = response.content_length().unwrap_or(0);
    let file_name = url.split('/').last().unwrap_or("model.gguf").to_string();

    // Save to app data dir
    let model_dir = dirs_next::data_local_dir()
        .unwrap_or_else(|| std::path::PathBuf::from("."))
        .join("EduCloud")
        .join("models");
    std::fs::create_dir_all(&model_dir).map_err(|e| e.to_string())?;
    let dest = model_dir.join(&file_name);

    let mut file = tokio::fs::File::create(&dest)
        .await
        .map_err(|e| format!("Failed to create file: {e}"))?;

    let mut downloaded: u64 = 0;
    let mut stream = response.bytes_stream();

    use futures_util::StreamExt;
    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| format!("Download error: {e}"))?;
        downloaded += chunk.len() as u64;

        use tokio::io::AsyncWriteExt;
        file.write_all(&chunk)
            .await
            .map_err(|e| format!("Write error: {e}"))?;

        let progress = if total > 0 {
            downloaded as f32 / total as f32
        } else {
            0.5
        };
        let _ = progress_tx.send(progress);
    }

    let path = dest.to_string_lossy().to_string();
    let mut status = state.model_status.lock().unwrap();
    *status = ModelStatus::Ready { path: path.clone() };

    Ok(path)
}

/// Start llama-server sidecar on a random available port.
/// Returns the port number the server is listening on.
#[tauri::command]
pub async fn start_llama_server(
    model_path: String,
    state: tauri::State<'_, AppState>,
) -> Result<u16, String> {
    // Pick an available port
    let port = find_available_port().await?;

    let sidecar_path = std::env::current_exe()
        .map(|p| p.parent().map(|d| d.join("bin/llama-server")).unwrap_or_default())
        .map_err(|e| e.to_string())?;

    let mut child = Command::new(&sidecar_path)
        .args([
            "--model", &model_path,
            "--host", "127.0.0.1",
            "--port", &port.to_string(),
            "--ctx-size", "4096",
        ])
        .stdout(std::process::Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to start llama-server: {e}"))?;

    // Wait until server is ready (look for "listening" in stdout)
    if let Some(stdout) = child.stdout.take() {
        let mut reader = BufReader::new(stdout).lines();
        while let Ok(Some(line)) = reader.next_line().await {
            if line.contains("listening") || line.contains("HTTP server") {
                break;
            }
        }
    }

    let mut port_state = state.llama_port.lock().unwrap();
    *port_state = Some(port);

    Ok(port)
}

/// Get the current model status.
#[tauri::command]
pub async fn get_model_status(state: tauri::State<'_, AppState>) -> Result<ModelStatus, String> {
    Ok(state.model_status.lock().unwrap().clone())
}

async fn find_available_port() -> Result<u16, String> {
    use tokio::net::TcpListener;
    let listener = TcpListener::bind("127.0.0.1:0")
        .await
        .map_err(|e| e.to_string())?;
    let port = listener.local_addr().map_err(|e| e.to_string())?.port();
    Ok(port)
}
