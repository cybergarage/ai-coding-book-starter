#!/usr/bin/env bash

set -euo pipefail

if [[ $# -lt 1 || $# -gt 2 ]]; then
  echo "Usage: $0 <git-ref> [output-directory]" >&2
  exit 2
fi

release_ref=$1
repository_root=$(git rev-parse --show-toplevel)
output_directory=${2:-"${repository_root}/dist"}
archive_name="ai-coding-starter-${release_ref}.zip"
archive_path="${output_directory}/${archive_name}"

git -C "${repository_root}" rev-parse --verify "${release_ref}^{commit}" >/dev/null
mkdir -p "${output_directory}"
git -C "${repository_root}" archive \
  --format=zip \
  --prefix=ai-coding-starter/ \
  --output="${archive_path}" \
  "${release_ref}:starter"

echo "Created ${archive_path}"
