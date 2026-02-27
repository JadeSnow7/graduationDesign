use std::{thread, time::Duration};

use thiserror::Error;
use tokio::{sync::mpsc, task};

#[derive(Debug, Error, PartialEq, Eq)]
pub enum EngineError {
    #[error("model path cannot be empty")]
    InvalidModelPath,
}

#[derive(Debug, Clone)]
pub struct LlamaEngine {
    model_path: String,
}

impl LlamaEngine {
    pub fn new(model_path: &str) -> Result<Self, EngineError> {
        if model_path.trim().is_empty() {
            return Err(EngineError::InvalidModelPath);
        }

        Ok(Self {
            model_path: model_path.to_owned(),
        })
    }

    pub async fn stream_chat(&self, prompt: String) -> mpsc::Receiver<String> {
        let (tx, rx) = mpsc::channel(16);
        let model_path = self.model_path.clone();

        task::spawn_blocking(move || {
            let _ = (model_path, prompt);
            let tokens = ["EduEdge", "本地", "AI", "初始化", "成功"];

            for token in tokens {
                thread::sleep(Duration::from_millis(120));

                if tx.blocking_send(token.to_string()).is_err() {
                    break;
                }
            }
        });

        rx
    }
}
