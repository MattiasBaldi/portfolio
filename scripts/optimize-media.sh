#!/bin/bash

# Media Optimization Script
# Creates lightbox/ and marquee/ folders with optimized media
# Root files -> lightbox/ (copy as-is, already compressed)
# Root files -> marquee/ (500px height, 7s max for videos)

set +e  # Don't exit on error, continue processing

PUBLIC_DIR="./public"
MARQUEE_HEIGHT=500

echo "🎬 Starting media optimization..."
echo "================================"

# Check if ffmpeg is available
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ ffmpeg is required but not installed"
    exit 1
fi

# Function to process media files in a directory
process_directory() {
    local dir="$1"
    local dir_name=$(basename "$dir")

    echo "   📂 Processing: $dir_name"

    # Create lightbox and marquee directories
    local lightbox_dir="$dir/lightbox"
    local marquee_dir="$dir/marquee"
    mkdir -p "$lightbox_dir"
    mkdir -p "$marquee_dir"

    # Process media files
    for file in "$dir"/*; do
        if [ ! -f "$file" ]; then
            continue
        fi

        filename=$(basename "$file")
        extension="${filename##*.}"
        name="${filename%.*}"

        # Skip if file is already in lightbox or marquee
        if [[ "$file" == *"/lightbox/"* ]] || [[ "$file" == *"/marquee/"* ]]; then
            continue
        fi

        # Skip thumbnails (processed separately)
        if [[ "$filename" == thumbnail.* ]]; then
            continue
        fi

        echo "      🔄 $filename"

        # Copy to lightbox as-is (already compressed defaults)
        cp "$file" "$lightbox_dir/$filename"
        echo "         ✅ Copied to lightbox/"

        # Process for marquee based on type
        case "$extension" in
            webm|mp4|mov|m4v|ogg)
                # Video: 500px height, 7 seconds max
                ffmpeg -i "$file" -t 7 -vf "scale=-2:$MARQUEE_HEIGHT" \
                    -c:v libvpx-vp9 -crf 35 -b:v 0 \
                    -an -y \
                    "$marquee_dir/$name.webm" \
                    2>&1 | grep -E "(Duration|Output|Stream mapping)" || true
                echo "         ✅ Created marquee video (7s, ${MARQUEE_HEIGHT}px)"
                ;;

            gif)
                # GIF: Use ffmpeg to avoid ImageMagick size limits
                ffmpeg -i "$file" -vf "scale=-2:$MARQUEE_HEIGHT" \
                    -c:v libvpx-vp9 -crf 35 -b:v 0 -an -y \
                    "$marquee_dir/$name.webm" \
                    2>&1 | grep -E "(Duration|Output|Stream mapping)" || true
                # Also keep original GIF format, resized with sips
                sips -Z "$MARQUEE_HEIGHT" "$file" --out "$marquee_dir/$filename" &> /dev/null || true
                echo "         ✅ Created marquee GIF/video (${MARQUEE_HEIGHT}px)"
                ;;

            webp|jpg|jpeg|png)
                # Image: Resize to 500px height using magick or sips
                if command -v magick &> /dev/null; then
                    magick "$file" -resize "x$MARQUEE_HEIGHT" "$marquee_dir/$filename" 2>&1 | head -1 || true
                    echo "         ✅ Created marquee image (${MARQUEE_HEIGHT}px)"
                else
                    # Fallback: use sips (macOS)
                    sips -Z "$MARQUEE_HEIGHT" "$file" --out "$marquee_dir/$filename" &> /dev/null || true
                    echo "         ✅ Created marquee image (${MARQUEE_HEIGHT}px)"
                fi
                ;;

            *)
                echo "         ⏭️  Skipping (unsupported format)"
                ;;
        esac
    done
}

# Process each project folder
for project_dir in "$PUBLIC_DIR"/*; do
    if [ ! -d "$project_dir" ]; then
        continue
    fi

    project_name=$(basename "$project_dir")
    echo ""
    echo "📁 Processing: $project_name"
    echo "----------------------------"

    # Count media files directly in project root
    media_count=$(find "$project_dir" -maxdepth 1 -type f \( -name "*.webm" -o -name "*.webp" -o -name "*.gif" -o -name "*.jpg" -o -name "*.png" \) ! -name "thumbnail.*" | wc -l | tr -d ' ')

    # If project has media files directly, process them
    if [ "$media_count" -gt 0 ]; then
        process_directory "$project_dir"
    fi

    # Also check for subfolders with media (like spicemyway/experience)
    for sub_dir in "$project_dir"/*; do
        if [ ! -d "$sub_dir" ]; then
            continue
        fi

        sub_name=$(basename "$sub_dir")

        # Skip special folders
        if [[ "$sub_name" == "originals" ]] || [[ "$sub_name" == "lightbox" ]] || [[ "$sub_name" == "marquee" ]]; then
            echo "   ⏭️  Skipping $sub_name folder"
            continue
        fi

        # Count media files in subfolder
        sub_media_count=$(find "$sub_dir" -maxdepth 1 -type f \( -name "*.webm" -o -name "*.webp" -o -name "*.gif" -o -name "*.jpg" -o -name "*.png" \) ! -name "thumbnail.*" | wc -l | tr -d ' ')

        if [ "$sub_media_count" -gt 0 ]; then
            process_directory "$sub_dir"
        fi
    done

    # Process thumbnail at project root
    for thumb in "$project_dir"/thumbnail.*; do
        if [ -f "$thumb" ]; then
            filename=$(basename "$thumb")
            extension="${filename##*.}"

            echo "   🖼️  Compressing thumbnail: $filename"

            case "$extension" in
                gif)
                    # Use sips for GIF thumbnails to avoid ImageMagick limits
                    sips -Z "$MARQUEE_HEIGHT" "$thumb" --out "${thumb}.tmp" &> /dev/null && mv "${thumb}.tmp" "$thumb"
                    echo "      ✅ Compressed thumbnail GIF"
                    ;;
                webp|jpg|jpeg|png)
                    if command -v magick &> /dev/null; then
                        magick "$thumb" -resize "x$MARQUEE_HEIGHT" "${thumb}.tmp" && mv "${thumb}.tmp" "$thumb"
                        echo "      ✅ Compressed thumbnail"
                    else
                        sips -Z "$MARQUEE_HEIGHT" "$thumb" --out "${thumb}.tmp" &> /dev/null && mv "${thumb}.tmp" "$thumb"
                        echo "      ✅ Compressed thumbnail"
                    fi
                    ;;
            esac
        fi
    done
done

echo ""
echo "================================"
echo "✨ Optimization complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Update data.json to use lightbox/ and marquee/ paths"
echo "   2. Use marquee/ for Marquee component"
echo "   3. Use lightbox/ for Gallery/Lightbox component"
