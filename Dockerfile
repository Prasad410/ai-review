# syntax=docker/dockerfile:1

# --- Build stage ---
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=https://aireview.com
ARG VITE_API_RANK_PATH=/v1/rank
ARG VITE_USE_MOCK_API=false

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_RANK_PATH=$VITE_API_RANK_PATH
ENV VITE_USE_MOCK_API=$VITE_USE_MOCK_API

RUN npm run build

# --- Production stage ---
FROM nginx:1.27-alpine AS production

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/health || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
