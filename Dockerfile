# Local Vite tooling for docker compose (not used for Cloudflare production).
FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 5173 4173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
