#!/bin/sh -e
# Motivation: ChRIS_ui is a React.js application built using Vite, deployed as a static
#             single-page web application. Typically, this kind of application is configured
#             at build time. However, we want a convenient way to reconfigure the built
#             application in a container using environment variables.
# Purpose:    Copy the build assets to another location while overwriting configurations
#             with environment variable values. Lastly, run a specified command.

# When running on Podman with default settings, the host IP address is added to /etc/hosts
# by Podman by the name "host.containers.local" which we'll use as the IP address.
if [ "${CHRIS_UI_DETECT_PODMAN-no}" != 'no' ]; then
  PODMAN_HOST_IP="$(grep -m 1 -F host.containers.internal /etc/hosts | awk '{print $1}')"
  if [ -n "$PODMAN_HOST_IP" ]; then
    if [ -z "$CHRIS_UI_URL" ]; then
      CHRIS_UI_URL="http://$PODMAN_HOST_IP:8000/api/v1/"
    fi
    if [ -z "$PFDCM_URL" ]; then
      PFDCM_URL="http://$PODMAN_HOST_IP:4005/"
    fi
    if [ -z "$OHIF_URL" ]; then
      OHIF_URL="http://$PODMAN_HOST_IP:8042/ohif/"
    fi
  fi
fi

# read the default values from the .env.production file used by `vite build`
env_file=/build/.env.production
access_mode="$(stat -c '%a' "$env_file")"
if [ "$access_mode" != '444' ]; then
  echo "error: insecure permissions on $env_file. Expected 444, actual $access_mode"
  exit 1
fi
source "$env_file"


target=/srv

if find "$target" -mindepth 1 | grep -q .; then
  echo "error: $target not empty, refusing to overwrite."
  exit 1
fi

# create directories in target folder
cd /build
find -type d -exec mkdir -p "$target/{}" \;

# set default values
CHRIS_STORE_URL="${CHRIS_STORE_URL-https://cube.chrisproject.org/api/v1/}"
# OHIF_URL, ACKEE_SERVER, ACKEE_DOMAIN_ID default values are empty

# required values
required_variable_names="CHRIS_UI_URL PFDCM_URL"
for variable_name in $required_variable_names; do
  eval "value=\$$variable_name"
  if [ -z "$value" ]; then
    echo "error: $variable_name is unset or empty"
    exit 1
  fi
done

# copy static files, replace variable values, and write them to /srv
cd /build
find -type f -exec sh -c "cat '{}' \
  | sed 's#$VITE_CHRIS_UI_URL#$CHRIS_UI_URL#g' \
  | sed 's#$VITE_CHRIS_STORE_URL#$CHRIS_STORE_URL#g' \
  | sed 's#$VITE_PFDCM_URL#$PFDCM_URL#g' \
  | sed 's#$VITE_OHIF_URL#$OHIF_URL#g' \
  | sed 's#$VITE_ACKEE_SERVER#$ACKEE_SERVER#g' \
  | sed 's#$VITE_ACKEE_DOMAIN_ID#$ACKEE_DOMAIN_ID#g' \
  > $target/{}" \;

# run specified command
exec "$@"
