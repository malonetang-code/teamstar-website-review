#!/bin/sh
set -eu

root_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
process_dir="$root_dir/images/web/process-20260725"
video_out="$process_dir/home-manufacturing-montage.mp4"
poster_out="$process_dir/home-manufacturing-montage-poster.jpg"
mobile_poster_out="$process_dir/home-manufacturing-montage-poster-mobile.jpg"

ffmpeg -hide_banner -loglevel error \
  -ss 2.4 -t 3.2 -i "$process_dir/02-blank-shaping.mp4" \
  -ss 0.5 -t 3.2 -i "$process_dir/03-heat-treatment.mp4" \
  -ss 0.8 -t 3.2 -i "$process_dir/04-machining-press-feed.mp4" \
  -ss 0.5 -t 3.2 -i "$process_dir/07-final-inspection.mp4" \
  -filter_complex "[0:v]setpts=PTS-STARTPTS,scale=1280:720:force_original_aspect_ratio=decrease,pad=1536:720:(ow-iw)/2:(oh-ih)/2:color=#111416,fade=t=in:st=0:d=0.2[v0];[1:v]setpts=PTS-STARTPTS,scale=1280:720:force_original_aspect_ratio=decrease,pad=1536:720:(ow-iw)/2:(oh-ih)/2:color=#111416[v1];[2:v]setpts=PTS-STARTPTS,scale=1280:720:force_original_aspect_ratio=decrease,pad=1536:720:(ow-iw)/2:(oh-ih)/2:color=#111416[v2];[3:v]setpts=PTS-STARTPTS,scale=1280:720:force_original_aspect_ratio=decrease,pad=1536:720:(ow-iw)/2:(oh-ih)/2:color=#111416[v3];[v0][v1]xfade=transition=fade:duration=0.25:offset=2.95[x1];[x1][v2]xfade=transition=fade:duration=0.25:offset=5.90[x2];[x2][v3]xfade=transition=fade:duration=0.25:offset=8.85,fade=t=out:st=11.82:d=0.2[outv]" \
  -map '[outv]' \
  -an \
  -c:v libx264 \
  -preset slow \
  -crf 23 \
  -pix_fmt yuv420p \
  -movflags +faststart \
  -r 30 \
  "$video_out" \
  -y

ffmpeg -hide_banner -loglevel error \
  -ss 0.7 \
  -i "$video_out" \
  -frames:v 1 \
  "$poster_out" \
  -y

ffmpeg -hide_banner -loglevel error \
  -i "$poster_out" \
  -vf "scale=720:338:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2:color=#111416" \
  -frames:v 1 \
  "$mobile_poster_out" \
  -y

printf 'Built %s\n' "$video_out"
