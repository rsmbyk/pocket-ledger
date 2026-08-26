# Local Vite tooling for docker compose (not used for Cloud Run production).
FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json
RUN npm ci

COPY . .

EXPOSE 5173 4173

CMD ["npm", "run", "dev", "-w", "@pocket-ledger/web", "--", "--host", "0.0.0.0", "--port", "5173"]
