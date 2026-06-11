# Stage 1: Build the client
FROM node:20-slim AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install --ignore-scripts
COPY client/ ./
RUN npm run build

# Stage 2: Final image
FROM node:20-slim
WORKDIR /app

# Install essential build tools
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    git \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Copy root package.json for concurrently
COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts && npm install concurrently --ignore-scripts

# Copy server
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev --ignore-scripts
COPY server/ ./server/

# Copy built client from Stage 1
COPY --from=client-builder /app/client/.next ./client/.next
COPY --from=client-builder /app/client/public ./client/public
COPY --from=client-builder /app/client/package*.json ./client/
RUN cd client && npm install --omit=dev --ignore-scripts

EXPOSE 3000
EXPOSE 5001

ENV BACKEND_PORT=5001

# Command to run both (Next.js on 3000, Express on 5001) using root package.json
CMD ["npm", "start"]
