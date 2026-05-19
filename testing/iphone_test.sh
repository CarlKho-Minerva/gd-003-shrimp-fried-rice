#!/bin/bash

# Change to the directory where this script is located
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

# Get the device name from the argument, or default if none provided
DEVICE_NAME="${1:-iPhone Unknown}"

# Create a results directory if it doesn't exist (inside the script's directory)
mkdir -p results

# Generate a timestamp for the test run
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
# Sanitize the device name for the file name (replace spaces with underscores)
SAFE_DEVICE_NAME=$(echo "$DEVICE_NAME" | tr ' ' '_')
LOG_FILE="results/iphone_test_${SAFE_DEVICE_NAME}_${TIMESTAMP}.log"

echo "========================================"
echo "Starting Tests for: $DEVICE_NAME at $TIMESTAMP"
echo "Results will be saved to: $DIR/$LOG_FILE"
echo "========================================"

# Run the test suite and tee the output to both terminal and log file
# NOTE: Make sure the game server (WebSocket server) is running on port 3000 first!
node iphone_test_suite.js "$DEVICE_NAME" | tee "$LOG_FILE"

echo ""
echo "========================================"
echo "Test complete! Results saved successfully to:"
echo "$DIR/$LOG_FILE"
echo "========================================"
