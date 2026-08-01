FROM docker.io/library/node:24.8.0-bookworm-slim@sha256:cadbfafeb6baf87eaaffa40b3640209c4b7fd38cebde65059d15bc39cd636b85 AS build

WORKDIR /src
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM docker.io/nginxinc/nginx-unprivileged:1.29.5-alpine3.23-slim@sha256:08c2bc93448bc00d2a2e86cd2f8f729220f1d48b56bbf7f211e117fcfe0c4cb6

COPY --from=build --chown=101:101 /src/dist /usr/share/nginx/html
COPY --chown=101:101 docker/server.conf /etc/nginx/conf.d/default.conf
COPY --chmod=0555 docker/19-validate-runtime-config.sh /docker-entrypoint.d/19-validate-runtime-config.sh
COPY --chown=101:101 public/config.template.js /etc/nginx/templates/config.js.template

ENV NGINX_ENVSUBST_TEMPLATE_DIR=/etc/nginx/templates \
    NGINX_ENVSUBST_OUTPUT_DIR=/usr/share/nginx/html

USER 101:101
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
    CMD ["wget", "-q", "-O", "/dev/null", "http://127.0.0.1:8080/"]
