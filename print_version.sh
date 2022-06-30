#!/bin/bash
# purpose: print out a version string: YYYYMMDD.X+commit(-dirty?)
#          YYYYMMDD = current date
#                 X = number of merge commits since the tag version-0
#            commit = HEAD commit short sha
#            -drity = suffix indicating there are uncommitted changes

printf "%s.%s+%s%s" \
  "$(date '+%Y%m%d')" \
  "$(git rev-list --use-bitmap-index --count --merges version-0..HEAD)" \
  "$(git rev-parse --short HEAD)" \
  "$(git diff --quiet src/ || echo '-dirty')"
