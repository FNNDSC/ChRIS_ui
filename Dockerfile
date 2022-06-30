# ChRIS_ui production mode server
#
# Build with
#
#   docker build -t <name> .
#
# For example if building a local version, you could do:
#
#   docker build -t local/chris_ui .
#
# In the case of a proxy (located at say 10.41.13.4:3128), do:
#
#    export PROXY="http://10.41.13.4:3128"
#    docker build --build-arg http_proxy=${PROXY} -t local/chris_ui .
#
# To run the server up, do:
#
#   docker run --name chris_ui -p 3000:3000 -d local/chris_ui
#
# To run an interactive shell inside this container, do:
#
#   docker exec -it chris_ui sh
#
# Tips:
# - for access logging, remove "--quiet" from CMD
# - docker-entrypoint.sh must start as root


FROM node:16 as builder

WORKDIR /app
COPY . .

RUN npm run -s print-version
RUN npm install
RUN npm run build 


FROM node:16-alpine

RUN yarn global add sirv-cli

WORKDIR /app

COPY --from=builder /app/build /app
COPY ./docker-entrypoint.sh /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
ENV HOST=0.0.0.0 PORT=3000
CMD ["sirv", "--quiet", "--etag", "--single"]
EXPOSE 3000
