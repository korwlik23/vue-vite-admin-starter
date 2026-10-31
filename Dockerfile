FROM docker.io/library/node:24.22.1-bookworm-slim@sha256:be8204d4bd327363357f532187b752ff62759c31bedf98e9e18fc08c9cbd605c AS build

WORKDIR /src
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM docker.io/nginxinc/nginx-unprivileged:1.30.6-alpine3.24-slim@sha256:5d8bb9437d74a600ec5dbf90c035451c724dc33eac8d3a71078f6f8612c345f6

COPY --from=build --chown=101:101 /src/dist /usr/share/nginx/html
COPY --chown=101:101 docker/server.conf /etc/nginx/conf.d/default.conf
COPY --chmod=0555 docker/19-validate-runtime-config.sh /docker-entrypoint.d/19-validate-runtime-config.sh
COPY --chown=101:101 public/config.template.js /etc/nginx/templates/config.js.template

ENV NGINX_ENVSUBST_TEMPLATE_DIR=/etc/nginx/templates \
    NGINX_ENVSUBST_OUTPUT_DIR=/tmp/runtime-config

USER 101:101
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
    CMD ["wget", "-q", "-O", "/dev/null", "http://127.0.0.1:8080/"]
