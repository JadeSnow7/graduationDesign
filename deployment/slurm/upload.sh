#!/bin/bash
# ============================================================================
# Upload code to remote server
# Run this from local machine
# ============================================================================

SERVER="uu202214900@202.114.0.141"
PORT="21150"
REMOTE_DIR="~/mydesign"

echo "Uploading AI Service..."
scp -P $PORT -r code/ai_service/* $SERVER:$REMOTE_DIR/ai_service/

echo "Uploading Simulation Service..."
scp -P $PORT -r code/simulation/* $SERVER:$REMOTE_DIR/simulation/

echo "Uploading SLURM job script..."
scp -P $PORT deployment/slurm/gpu_job.sh $SERVER:$REMOTE_DIR/

echo "Upload complete!"
echo ""
echo "Next: SSH to server and run:"
echo "  sbatch ~/mydesign/gpu_job.sh"
