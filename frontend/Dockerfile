FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build the production bundle (VITE_API_URL is injected at build time via Railway env vars)
RUN npm run build

# Production stage - serve static files
FROM node:20-alpine

WORKDIR /app

RUN npm install -g serve@14

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
