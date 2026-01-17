#!/bin/bash
#SBATCH --job-name=ollama-cpu
#SBATCH --nodes=1
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=8
#SBATCH --mem=16G
#SBATCH --time=1-00:00:00
#SBATCH --output=ollama-cpu-%j.log
#SBATCH --error=ollama-cpu-%j.err

# ============================================================================
# Ollama + Qwen3 CPU Deployment Script
# ============================================================================

echo "=== Ollama LLM CPU Deployment ==="
echo "Job started at $(date)"
echo "Running on node: $(hostname)"
echo "CPUs allocated: $SLURM_CPUS_PER_TASK"
echo "Memory: 32GB"

# Setup environment
export HOME=/home/uu202214900
export OLLAMA_HOME=$HOME/.ollama
export OLLAMA_MODELS=$HOME/.ollama/models
export PATH=$HOME/bin:$PATH
export OLLAMA_NUM_PARALLEL=4
export OLLAMA_MAX_LOADED_MODELS=1

# Create directories
mkdir -p $HOME/bin
mkdir -p $OLLAMA_HOME

# Download Ollama if not exists
if [ ! -f "$HOME/bin/ollama" ]; then
    echo "Downloading Ollama..."
    curl -L https://ollama.com/download/ollama-linux-amd64 -o $HOME/bin/ollama
    chmod +x $HOME/bin/ollama
fi

echo "Ollama version:"
$HOME/bin/ollama --version

# Start Ollama server in background
echo "Starting Ollama server (CPU mode)..."
OLLAMA_HOST=0.0.0.0:11434 nohup $HOME/bin/ollama serve > /tmp/ollama-server.log 2>&1 &
OLLAMA_PID=$!
sleep 10

# Check if server is running
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "Ollama server running on port 11434"
else
    echo "Failed to start Ollama server"
    cat /tmp/ollama-server.log
    exit 1
fi

# Pull a smaller model for CPU (qwen3:1.7b or qwen3:4b)
echo "Pulling Qwen3 model (CPU-friendly size)..."
$HOME/bin/ollama pull qwen3:4b

# List available models
echo "Available models:"
$HOME/bin/ollama list

# Test model
echo "Testing model..."
$HOME/bin/ollama run qwen3:4b "你好，请用一句话介绍你自己" --verbose

echo ""
echo "=== Ollama CPU Deployment Complete ==="
echo ""
echo "LLM Service running at: http://$(hostname):11434"
echo ""
echo "To configure AI service, set:"
echo "  LLM_BASE_URL=http://$(hostname):11434"
echo "  LLM_API_KEY=ollama"
echo "  LLM_MODEL=qwen3:4b"
echo ""
echo "Note: CPU inference is slower than GPU. Expect ~5-10s per response."
echo ""
echo "Server running. Press Ctrl+C to stop."

# Keep running
wait $OLLAMA_PID
