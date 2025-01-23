#!/bin/bash

# image4web.sh
# A script to convert image files to .webp using FFmpeg
# Usage: image4web.sh <input_file.[jpg|jpeg|png|bmp|gif|tiff]>
# Optional: Specify max width and height
# Example: image4web.sh input.png 300 300

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
  echo "Error: FFmpeg is not installed. Please install it and try again."
  exit 1
fi

# Usage instructions
if [ "$#" -lt 1 ] || [ "$#" -gt 3 ]; then
  echo "Usage: $0 <input_file_or_directory> [max_width] [max_height]"
  echo "Converts an image or all images in a directory to compressed .webp files."
  echo "  <input_file_or_directory>: Path to the input image file or directory"
  echo "  [max_width]: Optional maximum width of the output image(s)"
  echo "  [max_height]: Optional maximum height of the output image(s)"
  exit 1
fi

# Input argument
input_path="$1"

# Optional dimensions
max_width="${2:-}"
max_height="${3:-}"

# Prepare FFmpeg scaling options (preserve aspect ratio if dimensions are specified)
scale_filter="scale=w=iw:h=ih"
if [ -n "$max_width" ] && [ -n "$max_height" ]; then
  scale_filter="scale='if(gt(a,${max_width}/${max_height}),${max_width},-1)':\
  'if(gt(a,${max_width}/${max_height}),-1,${max_height})'"
elif [ -n "$max_width" ]; then
  scale_filter="scale=${max_width}:-1"
elif [ -n "$max_height" ]; then
  scale_filter="scale=-1:${max_height}"
fi

# Function to process a single file
process_file() {
  local input_file="$1"
  local output_file="${input_file%.*}.webp"
  ffmpeg -i "$input_file" -vf "$scale_filter" -c:v libwebp -q:v 80 "$output_file"
  echo "Conversion complete! Output saved to $output_file"
}

# Check if input is a directory or a file
if [ -d "$input_path" ]; then
  echo "Processing all image files in directory: $input_path"
  for file in "$input_path"/*.{jpg,jpeg,png,gif,tiff,bmp}; do
    [ -e "$file" ] || continue  # Skip if no matching files
    process_file "$file"
  done
elif [ -f "$input_path" ]; then
  process_file "$input_path"
else
  echo "Error: $input_path is not a valid file or directory."
  exit 1
fi
