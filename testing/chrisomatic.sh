#!/usr/bin/env bash

# get the directory where this script lives
HERE="$(dirname -- "$0")"

# get image version of chrisomatic from docker-compose.yml
CHRISOMATIC_IMAGE="$(
  grep 'image:' "$HERE/miniChRIS/docker-compose.yml" \
    | grep -Eo '[a-zA-Z\.]+/.+/chrisomatic:.+'
)"

# do not use tty option in GitHub Actions
if [ "$CI" != "true" ]; then
  use_tty='-it'
fi

set -ex
exec docker run --rm $use_tty --net=host --userns=host \
  -v "$(realpath "$HERE")/chrisomatic.yml:/chrisomatic.yml:ro" \
  -v "/var/run/docker.sock:/var/run/docker.sock:rw" \
  "$CHRISOMATIC_IMAGE"
