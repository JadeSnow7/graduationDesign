use sysinfo::System;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ComputeBackend {
    CoreML,
    DirectML,
    Metal,
    Vulkan,
    CPU(usize),
}

pub struct HardwareProber;

impl HardwareProber {
    fn detect_cpu_threads() -> usize {
        let system = System::new_all();
        system.cpus().len()
    }

    pub fn probe_best_backend() -> ComputeBackend {
        let cpu_threads = Self::detect_cpu_threads();
        Self::probe_best_backend_for_platform(cpu_threads)
    }

    #[cfg(target_os = "macos")]
    fn probe_best_backend_for_platform(cpu_threads: usize) -> ComputeBackend {
        if cfg!(target_arch = "aarch64") {
            return ComputeBackend::CoreML;
        }

        if cfg!(target_arch = "x86_64") {
            return ComputeBackend::Metal;
        }

        ComputeBackend::CPU(cpu_threads.max(1))
    }

    #[cfg(target_os = "windows")]
    fn probe_best_backend_for_platform(cpu_threads: usize) -> ComputeBackend {
        if cpu_threads > 0 {
            return ComputeBackend::DirectML;
        }

        ComputeBackend::CPU(1)
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    fn probe_best_backend_for_platform(cpu_threads: usize) -> ComputeBackend {
        ComputeBackend::CPU(cpu_threads.max(1))
    }
}
