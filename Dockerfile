FROM node:24.22.2-bookworm-slim@sha256:c86ecead9e55a5210ac1727de38a4ca840bf03dcaf34dc9749addbf383b1920c
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg ca-certificates && rm -rf /var/lib/apt/lists/* && npm install -g pnpm@10.33.2
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN HUSKY=0 pnpm install --frozen-lockfile --ignore-scripts
COPY src/service src/service
COPY src/domain src/domain
COPY src/contracts src/contracts
COPY specification/project.schema.json specification/project.schema.json
ENV JENCUT_WORKSPACE=/data JENCUT_HOST=0.0.0.0 JENCUT_PORT=4318
EXPOSE 4318
CMD ["pnpm", "service"]
