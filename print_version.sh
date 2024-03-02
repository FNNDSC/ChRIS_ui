#!/bin/bash
# purpose: print out a version string: YYYYMMDD.X-commit(-dirty?)
#          YYYYMMDD = current date
#                 X = number of merge commits since a specific commit in the past
#            commit = HEAD commit short sha
#            -drity = suffix indicating there are uncommitted changes

VERSION_ZERO=28a5018b6f4df807245965315c11580ee7cb1f88

printf "%s.%s-%s%s" \
  "$(date '+%Y%m%d')" \
  "$(git rev-list --use-bitmap-index --count --merges $VERSION_ZERO..HEAD)" \
  "$(git rev-parse --short HEAD)" \
  "$(git diff --quiet src/ || echo '-dirty')"
