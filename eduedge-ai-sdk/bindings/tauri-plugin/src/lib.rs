//! EduEdge AI SDK Tauri plugin bindings.

use std::sync::Mutex;

use eduedge_ai_core::{ComputeBackend, HardwareProber, LlamaEngine};
use serde::Serialize;
use tauri::{
    plugin::{Builder, TauriPlugin},
    AppHandle, Emitter, Manager, Runtime, State,
};

const LOCK_POISONED_ERROR: &str = "app state lock poisoned";
const MODEL_NOT_INITIALIZED_ERROR: &str = "model not initialized";
const EMPTY_MODEL_PATH_ERROR: &str = "model path cannot be empty";
const EMPTY_STREAM_ID_ERROR: &str = "stream id cannot be empty";
const INVALID_STREAM_ID_ERROR: &str =
    "stream id contains invalid characters; only [A-Za-z0-9_:/-] are allowed";

#[derive(Default)]
pub struct AppState {
    pub engine: Mutex<Option<LlamaEngine>>,
    pub active_model_path: Mutex<Option<String>>,
    pub lifecycle_lock: Mutex<()>,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum ModelInitStatus {
    Started,
    AlreadyReady,
    Reloaded,
    HealthChecked,
    NotInitialized,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub enum BackendName {
    CoreML,
    DirectML,
    Metal,
    Vulkan,
    CPU,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub struct InitLocalModelResponse {
    pub status: &'static str,
    pub backend: BackendName,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
struct LlmTokenEvent {
    stream_id: String,
    token: String,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
struct LlmFinishEvent {
    stream_id: String,
}

fn normalize_model_path(model_path: &str) -> Result<String, String> {
    let normalized = model_path.trim();
    if normalized.is_empty() {
        return Err(EMPTY_MODEL_PATH_ERROR.to_string());
    }
    Ok(normalized.to_string())
}

fn normalize_stream_id(stream_id: &str) -> Result<String, String> {
    let normalized = stream_id.trim();
    if normalized.is_empty() {
        return Err(EMPTY_STREAM_ID_ERROR.to_string());
    }
    if !normalized
        .chars()
        .all(|c| c.is_ascii_alphanumeric() || matches!(c, '_' | ':' | '/' | '-'))
    {
        return Err(INVALID_STREAM_ID_ERROR.to_string());
    }
    Ok(normalized.to_string())
}

fn create_engine(model_path: &str) -> Result<LlamaEngine, String> {
    LlamaEngine::new(model_path).map_err(|err| err.to_string())
}

fn detect_backend_name() -> BackendName {
    match HardwareProber::probe_best_backend() {
        ComputeBackend::CoreML => BackendName::CoreML,
        ComputeBackend::DirectML => BackendName::DirectML,
        ComputeBackend::Metal => BackendName::Metal,
        ComputeBackend::Vulkan => BackendName::Vulkan,
        ComputeBackend::CPU(_) => BackendName::CPU,
    }
}

fn build_init_response() -> InitLocalModelResponse {
    InitLocalModelResponse {
        status: "success",
        backend: detect_backend_name(),
    }
}

fn init_local_model_inner(state: &AppState, model_path: String) -> Result<ModelInitStatus, String> {
    let normalized_path = normalize_model_path(&model_path)?;
    let _lifecycle_guard = state
        .lifecycle_lock
        .lock()
        .map_err(|_| LOCK_POISONED_ERROR.to_string())?;

    let mut path_guard = state
        .active_model_path
        .lock()
        .map_err(|_| LOCK_POISONED_ERROR.to_string())?;
    let mut engine_guard = state
        .engine
        .lock()
        .map_err(|_| LOCK_POISONED_ERROR.to_string())?;

    if path_guard.as_ref() == Some(&normalized_path) && engine_guard.is_some() {
        return Ok(ModelInitStatus::AlreadyReady);
    }

    let status = if path_guard.is_some() || engine_guard.is_some() {
        ModelInitStatus::Reloaded
    } else {
        ModelInitStatus::Started
    };

    let engine = create_engine(&normalized_path)?;
    *engine_guard = Some(engine);
    *path_guard = Some(normalized_path);

    Ok(status)
}

fn refresh_local_model_inner(
    state: &AppState,
    model_path: String,
) -> Result<ModelInitStatus, String> {
    let normalized_path = normalize_model_path(&model_path)?;
    let _lifecycle_guard = state
        .lifecycle_lock
        .lock()
        .map_err(|_| LOCK_POISONED_ERROR.to_string())?;

    let mut path_guard = state
        .active_model_path
        .lock()
        .map_err(|_| LOCK_POISONED_ERROR.to_string())?;
    let mut engine_guard = state
        .engine
        .lock()
        .map_err(|_| LOCK_POISONED_ERROR.to_string())?;

    if path_guard.is_none() || engine_guard.is_none() {
        return Ok(ModelInitStatus::NotInitialized);
    }

    if path_guard.as_ref() == Some(&normalized_path) {
        return Ok(ModelInitStatus::HealthChecked);
    }

    let engine = create_engine(&normalized_path)?;
    *engine_guard = Some(engine);
    *path_guard = Some(normalized_path);

    Ok(ModelInitStatus::Reloaded)
}

fn engine_for_stream(state: &AppState) -> Result<LlamaEngine, String> {
    let engine_guard = state
        .engine
        .lock()
        .map_err(|_| LOCK_POISONED_ERROR.to_string())?;
    engine_guard
        .clone()
        .ok_or_else(|| MODEL_NOT_INITIALIZED_ERROR.to_string())
}

#[tauri::command]
fn init_local_model(
    state: State<'_, AppState>,
    model_path: String,
) -> Result<InitLocalModelResponse, String> {
    let _ = init_local_model_inner(state.inner(), model_path)?;
    Ok(build_init_response())
}

#[tauri::command]
fn refresh_local_model(
    state: State<'_, AppState>,
    model_path: String,
) -> Result<ModelInitStatus, String> {
    refresh_local_model_inner(state.inner(), model_path)
}

#[tauri::command]
async fn stream_chat<R: Runtime>(
    app: AppHandle<R>,
    state: State<'_, AppState>,
    prompt: String,
    stream_id: String,
) -> Result<(), String> {
    let stream_id = normalize_stream_id(&stream_id)?;
    let engine = engine_for_stream(state.inner())?;
    let mut receiver: tokio::sync::mpsc::Receiver<String> = engine.stream_chat(prompt).await;
    let token_event_name = format!("llm-token:{stream_id}");
    let finish_event_name = format!("llm-finish:{stream_id}");

    tauri::async_runtime::spawn(async move {
        while let Some(token) = receiver.recv().await {
            let _ = app.emit(
                &token_event_name,
                LlmTokenEvent {
                    stream_id: stream_id.clone(),
                    token,
                },
            );
        }
        let _ = app.emit(&finish_event_name, LlmFinishEvent { stream_id });
    });

    Ok(())
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("eduedge-ai")
        .setup(|app, _api| {
            app.manage(AppState::default());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            #![plugin(eduedge_ai)]
            init_local_model,
            refresh_local_model,
            stream_chat
        ])
        .build()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn init_rejects_empty_model_path() {
        let state = AppState::default();
        let result = init_local_model_inner(&state, "   ".to_string());
        assert!(result.is_err());
    }

    #[test]
    fn init_transitions_started_already_ready_reloaded() {
        let state = AppState::default();

        let first = init_local_model_inner(&state, "model-a.gguf".to_string()).unwrap();
        assert_eq!(first, ModelInitStatus::Started);

        let second = init_local_model_inner(&state, "model-a.gguf".to_string()).unwrap();
        assert_eq!(second, ModelInitStatus::AlreadyReady);

        let third = init_local_model_inner(&state, "model-b.gguf".to_string()).unwrap();
        assert_eq!(third, ModelInitStatus::Reloaded);
    }

    #[test]
    fn refresh_transitions_not_initialized_health_checked_reloaded() {
        let state = AppState::default();

        let first_refresh = refresh_local_model_inner(&state, "model-a.gguf".to_string()).unwrap();
        assert_eq!(first_refresh, ModelInitStatus::NotInitialized);

        let init_result = init_local_model_inner(&state, "model-a.gguf".to_string()).unwrap();
        assert_eq!(init_result, ModelInitStatus::Started);

        let second_refresh = refresh_local_model_inner(&state, "model-a.gguf".to_string()).unwrap();
        assert_eq!(second_refresh, ModelInitStatus::HealthChecked);

        let third_refresh = refresh_local_model_inner(&state, "model-b.gguf".to_string()).unwrap();
        assert_eq!(third_refresh, ModelInitStatus::Reloaded);
    }

    #[test]
    fn stream_requires_initialized_model() {
        let state = AppState::default();
        let result = engine_for_stream(&state);
        assert!(result.is_err());
    }

    #[test]
    fn init_response_contains_success_and_backend() {
        let response = build_init_response();
        assert_eq!(response.status, "success");
        match response.backend {
            BackendName::CoreML
            | BackendName::Metal
            | BackendName::DirectML
            | BackendName::Vulkan
            | BackendName::CPU => {}
        }
    }

    #[test]
    fn stream_event_payload_contains_stream_id() {
        let stream_id = "stream-001".to_string();
        let token_event = LlmTokenEvent {
            stream_id: stream_id.clone(),
            token: "EduEdge".to_string(),
        };
        let finish_event = LlmFinishEvent {
            stream_id: stream_id.clone(),
        };

        assert_eq!(token_event.stream_id, stream_id);
        assert_eq!(finish_event.stream_id, "stream-001".to_string());
    }

    #[test]
    fn stream_id_rejects_invalid_characters() {
        assert!(normalize_stream_id("ok_stream-01:/x").is_ok());
        assert!(normalize_stream_id("bad stream").is_err());
        assert!(normalize_stream_id("bad*stream").is_err());
    }

    #[test]
    fn stream_event_names_include_stream_id() {
        let stream_id = "stream-001";
        let token_event_name = format!("llm-token:{stream_id}");
        let finish_event_name = format!("llm-finish:{stream_id}");

        assert_eq!(token_event_name, "llm-token:stream-001");
        assert_eq!(finish_event_name, "llm-finish:stream-001");
    }
}
