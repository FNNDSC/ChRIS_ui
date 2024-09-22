# Production image for ChRIS_ui.
#
# This is a simple image containing a static web server and the build assets.
#
# The web application needs to be built on-the-metal before building this container image.
# Instructions:
#
#     pnpm build && docker build -t localhost/fnndsc/chris_ui:latest .
#

FROM ghcr.io/static-web-server/static-web-server:2.33.0-alpine

COPY ./dist /build
COPY ./.env.production /build/.env.production

COPY ./docker-entrypoint.sh /docker-entrypoint.sh


COPY ./static-web-server.toml /etc/static-web-server/config.toml
ENV SERVER_CONFIG_FILE=/etc/static-web-server/config.toml

RUN chmod 444 /build/.env.production && chmod g+rwx /srv \
    && chmod 550 /etc/static-web-server && chmod 440 /etc/static-web-server/*

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["static-web-server"]
