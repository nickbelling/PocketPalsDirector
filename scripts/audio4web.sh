#!/bin/bash

# audio4web.sh
# A script to convert .mp3 or .wav files to .webm using FFmpeg
# Usage: audio4web.sh <input_file.mp3|input_file.wav>
# Optional: Specify bitrate and channels
# Example: audio4web.sh input.mp3 32k 1

# Function to display usage instructions
usage() {
    echo "Usage: $0 <input_file.mp3|input_file.wav> [bitrate] [channels]"
    echo "  <input_file> : Path to the input audio file (.mp3 or .wav)"
    echo "  [bitrate]    : Audio bitrate (default: 32k)"
    echo "  [channels]   : Number of audio channels (1 for mono, 2 for stereo; default: 1)"
    exit 1
}

# Function to check if FFmpeg is installed
check_ffmpeg() {
    if ! command -v ffmpeg &> /dev/null; then
        echo "Error: FFmpeg is not installed. Please install FFmpeg and try again."
        exit 1
    fi
}

# Check if help flag is used
if [[ "$1" == "-h" || "$1" == "--help" ]]; then
    usage
fi

# Check if at least one argument is provided
if [ "$#" -lt 1 ]; then
    echo "Error: Missing required argument."
    usage
fi

INPUT_FILE="$1"
BITRATE="${2:-32k}"   # Default bitrate: 32k
CHANNELS="${3:-1}"    # Default channels: 1 (mono)

# Check if FFmpeg is installed
check_ffmpeg

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: File '$INPUT_FILE' not found."
    exit 1
fi

# Get the file extension
EXTENSION="${INPUT_FILE##*.}"
EXTENSION_LOWER=$(echo "$EXTENSION" | tr '[:upper:]' '[:lower:]')

# Validate file extension
if [[ "$EXTENSION_LOWER" != "mp3" && "$EXTENSION_LOWER" != "wav" ]]; then
    echo "Error: Unsupported file format '$EXTENSION'. Please use .mp3 or .wav files."
    exit 1
fi

# Validate bitrate format (e.g., 32k)
if [[ ! "$BITRATE" =~ ^[0-9]+k$ ]]; then
    echo "Error: Invalid bitrate format '$BITRATE'. Use format like '32k'."
    exit 1
fi

# Validate channels
if [[ "$CHANNELS" != "1" && "$CHANNELS" != "2" ]]; then
    echo "Error: Invalid number of channels '$CHANNELS'. Use 1 for mono or 2 for stereo."
    exit 1
fi

# Derive output file name by replacing extension with .webm
OUTPUT_FILE="${INPUT_FILE%.*}.webm"

# Check if output file already exists
if [ -f "$OUTPUT_FILE" ]; then
    echo "Warning: Output file '$OUTPUT_FILE' already exists and will be overwritten."
fi

# Execute FFmpeg command with progress display
echo "Converting '$INPUT_FILE' to '$OUTPUT_FILE' with bitrate $BITRATE and $CHANNELS channel(s)..."
ffmpeg -i "$INPUT_FILE" -c:a libopus -b:a "$BITRATE" -ac "$CHANNELS" "$OUTPUT_FILE"

# Check if FFmpeg succeeded
if [ "$?" -eq 0 ]; then
    echo "Conversion successful: '$OUTPUT_FILE'"
else
    echo "Error: Conversion failed."
    exit 1
fi
