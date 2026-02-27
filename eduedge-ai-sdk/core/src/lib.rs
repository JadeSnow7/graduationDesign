//! EduEdge AI SDK core crate.
//! Hardware detection and model engine abstraction live here.

pub mod engine_llm;
pub mod hardware;

pub use engine_llm::{EngineError, LlamaEngine};
pub use hardware::{ComputeBackend, HardwareProber};

pub fn sdk_core_ready() -> bool {
    true
}
