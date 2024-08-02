#!/usr/bin/env bash

URLS=(http://localhost:5173 http://localhost:25173)

for url in "${URLS[@]}"; do
  curl -o /dev/null "$url" > /dev/null 2>&1
  if [ "$?" = "0" ]; then
    echo "$url"
    exit 0
  fi
done

echo "UI is not running. Please run `npm run dev`"
exit 1
