#!/bin/sh -e
# Motivation: `npm run build` is very slow, the fastest
#             way to get the UI up is `docker pull ... `
#             However, the backend url is built-in
#             to be http://localhost:8000/api/v1/
# Purpose:    Overwrite the URL of backend using a user-specified value.
#             `sed` is used to patch the `build/` directory.

target='http://localhost:8000/api/v1/'
api_url="${REACT_APP_CHRIS_UI_URL-nil}"

if [ "$(id -u)" != "0" ]; then
  if [ "$api_url" != 'nil' ]; then
    echo "ERROR: custom value REACT_APP_CHRIS_UI_URL=$api_url"
    echo "is set, but container user is not root."
    exit 1
  fi
  exec "$@"
fi

if [ "$api_url"  != 'nil' ]; then
  for build_file in $(find -type f); do
    sed -i -e "s#$target#$api_url#g" $build_file
  done
fi

exec "$@"
