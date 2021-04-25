# ChRIS_ui production mode server
#
# Tips:
# - for access logging, remove "--quiet" from CMD
# - docker-entrypoint.sh must start as root, and then
#   it creates an underprivileged user and downgrades itself.
#   This will not work on OpenShift where the container UID is random.
#   For high-security platforms, do not use docker-entrypoint.sh.


FROM node:14 as builder

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build 


FROM node:14-alpine

RUN yarn global add sirv-cli

WORKDIR /app

COPY --from=builder /app/build /app
COPY ./docker-entrypoint.sh /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
ENV HOST=0.0.0.0 PORT=3000
CMD ["sirv", "--quiet", "--etag", "--single"]
EXPOSE 3000
