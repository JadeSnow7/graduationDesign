#!/bin/bash
#SBATCH --job-name=ollama-llm
#SBATCH --partition=gpu
#SBATCH --account=uu202214900
#SBATCH --nodes=1
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=8
#SBATCH --gres=gpu:a100:1
#SBATCH --time=5-00:00:00
#SBATCH --output=ollama-%j.log
#SBATCH --error=ollama-%j.err
#SBATCH --comment=uu202214900

# ============================================================================
# Ollama + Qwen3 GPU Deployment Script
# ============================================================================

echo "=== Ollama LLM Deployment ==="
echo "Job started at $(date)"
echo "Running on node: $(hostname)"
echo "GPU info:"
nvidia-smi

# Setup environment
export HOME=/home/uu202214900
export OLLAMA_HOME=$HOME/.ollama
export OLLAMA_MODELS=$HOME/.ollama/models
export PATH=$HOME/bin:$PATH

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
echo "Starting Ollama server..."
OLLAMA_HOST=0.0.0.0:11434 nohup $HOME/bin/ollama serve > /tmp/ollama-server.log 2>&1 &
OLLAMA_PID=$!
sleep 5

# Check if server is running
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "Ollama server running on port 11434"
else
    echo "Failed to start Ollama server"
    cat /tmp/ollama-server.log
    exit 1
fi

# Pull model (choose based on GPU memory)
# A100 40GB can run: qwen3:8b, qwen3:14b
# A100 80GB can run: qwen3:32b, qwen3:72b
echo "Pulling Qwen3 model..."
$HOME/bin/ollama pull qwen3:8b

# List available models
echo "Available models:"
$HOME/bin/ollama list

# Test model
echo "Testing model..."
$HOME/bin/ollama run qwen3:8b "你好，请用一句话介绍你自己" --verbose

echo ""
echo "=== Ollama Deployment Complete ==="
echo ""
echo "To use this LLM from your AI service, set:"
echo "  LLM_BASE_URL=http://$(hostname):11434"
echo "  LLM_API_KEY=ollama"
echo "  LLM_MODEL=qwen3:8b"
echo ""
echo "Server running. Press Ctrl+C to stop."

# Keep running
wait $OLLAMA_PID
