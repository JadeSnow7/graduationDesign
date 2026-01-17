#!/bin/bash
#SBATCH --job-name=emfield-ai
#SBATCH --partition=gpu
#SBATCH --nodes=1
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=4
#SBATCH --gres=gpu:1
#SBATCH --time=5-00:00:00
#SBATCH --output=emfield-%j.log
#SBATCH --error=emfield-%j.err

# ============================================================================
# EMField AI Service - GPU Deployment Script
# ============================================================================

echo "Job started at $(date)"
echo "Running on node: $(hostname)"
echo "GPU info:"
nvidia-smi

# Setup environment
export HOME=/home/uu202214900
export PATH=$HOME/miniconda3/bin:$PATH
source $HOME/miniconda3/bin/activate emfield

# Copy data to /dev/shm for fast I/O (optional)
# cp -r $HOME/mydesign/data /dev/shm/emfield_data

# Set environment variables
export LLM_BASE_URL="http://localhost:11434"  # Ollama on GPU node
export LLM_API_KEY="ollama"
export LLM_MODEL="qwen3:4b"
export SIM_SERVICE_URL="http://localhost:8002"
export GRAPH_RAG_ENABLED=false

# Start services
cd $HOME/mydesign

echo "Starting Simulation Service on port 8002..."
cd simulation
uvicorn app.main:app --host 0.0.0.0 --port 8002 &
SIM_PID=$!
sleep 3

echo "Starting AI Service on port 8001..."
cd ../ai_service
uvicorn app.main:app --host 0.0.0.0 --port 8001 &
AI_PID=$!

echo "Services started:"
echo "  AI Service PID: $AI_PID"
echo "  Sim Service PID: $SIM_PID"

# Keep job running
wait

echo "Job finished at $(date)"
