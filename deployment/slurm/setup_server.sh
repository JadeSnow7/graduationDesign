#!/bin/bash
# ============================================================================
# EMField Platform - Server Setup Script
# Run this on the login node to prepare the environment
# ============================================================================

set -e

echo "=== EMField Server Setup Script ==="
echo ""

# 1. Install Miniconda
echo "[1/5] Installing Miniconda..."
if [ ! -d "$HOME/miniconda3" ]; then
    bash $HOME/Miniconda3-latest-Linux-x86_64.sh -b -p $HOME/miniconda3
    echo 'export PATH=$HOME/miniconda3/bin:$PATH' >> $HOME/.bashrc
fi
export PATH=$HOME/miniconda3/bin:$PATH

# 2. Create Python environment
echo "[2/5] Creating Python environment..."
if ! conda env list | grep -q "emfield"; then
    conda create -n emfield python=3.11 -y
fi
source activate emfield

# 3. Install dependencies
echo "[3/5] Installing Python dependencies..."
pip install --upgrade pip
pip install fastapi uvicorn httpx pydantic numpy scipy matplotlib sympy

# 4. Setup project directory
echo "[4/5] Setting up project directory..."
mkdir -p $HOME/mydesign/ai_service
mkdir -p $HOME/mydesign/simulation
mkdir -p $HOME/mydesign/logs

# 5. Instructions
echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "  1. Upload code from local machine:"
echo "     scp -P 21150 -r code/ai_service/* uu202214900@202.114.0.141:~/mydesign/ai_service/"
echo "     scp -P 21150 -r code/simulation/* uu202214900@202.114.0.141:~/mydesign/simulation/"
echo ""
echo "  2. Submit GPU job:"
echo "     sbatch ~/mydesign/gpu_job.sh"
echo ""
echo "  3. Check job status:"
echo "     squeue -u uu202214900"
echo ""
echo "  4. View logs:"
echo "     tail -f emfield-*.log"
echo ""
