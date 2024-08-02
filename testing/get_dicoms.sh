#!/usr/bin/env bash

HERE="$(dirname -- "$0")"

set -ex

cd "$HERE/sample_dicoms"
make neuro
cd -

exec "$HERE/miniChRIS/scripts/upload2orthanc.sh" "$HERE/sample_dicoms/data"
