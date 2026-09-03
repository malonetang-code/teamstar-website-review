#!/bin/zsh

set -euo pipefail

script_dir="${0:A:h}"
review_root="${script_dir:h}"
review_port="${1:-8089}"
mount_root="$(mktemp -d "${TMPDIR:-/tmp}/teamstar-local-review.XXXXXX")"

cleanup() {
  rm -f "${mount_root}/teamstar-review" "${mount_root}/teamstar-website-review"
  rmdir "${mount_root}" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# The current Concept 1 pages use /teamstar-review/ for navigation while the
# canonical review content still references /teamstar-website-review/ assets.
# Serve the same source at both paths so navigation and page assets stay in sync.
ln -s "${review_root}" "${mount_root}/teamstar-review"
ln -s "${review_root}" "${mount_root}/teamstar-website-review"

echo "Teamstar local review: http://127.0.0.1:${review_port}/teamstar-review/full-style-preview/1/"
echo "Press Ctrl-C to stop."

python3 -m http.server "${review_port}" --bind 127.0.0.1 --directory "${mount_root}"
