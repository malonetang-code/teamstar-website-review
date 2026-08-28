#!/bin/sh
set -eu

if [ "$#" -ne 2 ]; then
  printf 'Usage: %s <landscape-laser-video> <portrait-grinding-video>\n' "$0" >&2
  exit 2
fi

root_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
process_dir="$root_dir/images/web/process-20260725"
company_tour="$root_dir/../assets/incoming_website_materials_2026-07-17/网站材料/工厂巡礼视频.mp4"
laser_source=$1
grinding_source=$2
output_dir="$root_dir/full-style-preview/media"
video_out="$output_dir/home-manufacturing-closeup-preview-20260828.mp4"

mkdir -p "$output_dir"

ffmpeg -hide_banner -loglevel error \
  -ss 0 -t 3.2 -i "$company_tour" \
  -ss 4.3 -t 1.8 -i "$company_tour" \
  -ss 2.6 -t 2.2 -i "$laser_source" \
  -ss 0.5 -t 1.8 -i "$grinding_source" \
  -ss 2.4 -t 1.75 -i "$process_dir/02-blank-shaping.mp4" \
  -ss 0.5 -t 1.75 -i "$process_dir/03-heat-treatment.mp4" \
  -ss 0.8 -t 1.75 -i "$process_dir/04-machining-press-feed.mp4" \
  -ss 0.5 -t 1.75 -i "$process_dir/07-final-inspection.mp4" \
  -filter_complex "[0:v]setpts=PTS-STARTPTS,fps=30,settb=AVTB,scale=1280:720:force_original_aspect_ratio=decrease,pad=1536:720:(ow-iw)/2:(oh-ih)/2:color=#111416,fade=t=in:st=0:d=0.2[v0];[1:v]setpts=PTS-STARTPTS,fps=30,settb=AVTB,scale=1280:720:force_original_aspect_ratio=decrease,pad=1536:720:(ow-iw)/2:(oh-ih)/2:color=#111416[v1];[2:v]setpts=PTS-STARTPTS,fps=30,settb=AVTB,scale=1280:720:force_original_aspect_ratio=decrease,pad=1536:720:(ow-iw)/2:(oh-ih)/2:color=#111416[v2];[3:v]setpts=PTS-STARTPTS,fps=30,settb=AVTB,scale=-2:720,pad=1536:720:980:0:color=#111416[v3];[4:v]setpts=PTS-STARTPTS,fps=30,settb=AVTB,scale=1280:720:force_original_aspect_ratio=decrease,pad=1536:720:(ow-iw)/2:(oh-ih)/2:color=#111416[v4];[5:v]setpts=PTS-STARTPTS,fps=30,settb=AVTB,scale=1280:720:force_original_aspect_ratio=decrease,pad=1536:720:(ow-iw)/2:(oh-ih)/2:color=#111416[v5];[6:v]setpts=PTS-STARTPTS,fps=30,settb=AVTB,scale=1280:720:force_original_aspect_ratio=decrease,pad=1536:720:(ow-iw)/2:(oh-ih)/2:color=#111416[v6];[7:v]setpts=PTS-STARTPTS,fps=30,settb=AVTB,scale=1280:720:force_original_aspect_ratio=decrease,pad=1536:720:(ow-iw)/2:(oh-ih)/2:color=#111416[v7];[v0][v1]xfade=transition=fade:duration=0.25:offset=2.95[x1];[x1][v2]xfade=transition=fade:duration=0.25:offset=4.50[x2];[x2][v3]xfade=transition=fade:duration=0.25:offset=6.45[x3];[x3][v4]xfade=transition=fade:duration=0.25:offset=8.00[x4];[x4][v5]xfade=transition=fade:duration=0.25:offset=9.50[x5];[x5][v6]xfade=transition=fade:duration=0.25:offset=11.00[x6];[x6][v7]xfade=transition=fade:duration=0.25:offset=12.50,fade=t=out:st=14.05:d=0.2[outv]" \
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

printf 'Built %s\n' "$video_out"
