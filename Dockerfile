# Stage 1: Build the client
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install --ignore-scripts
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY client/ ./
RUN npm run build

# Stage 2: Final image
FROM node:20-alpine
WORKDIR /app

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

# Command to run both (Next.js on 3000, Express on 5001)
CMD ["npx", "concurrently", "\"cd server && npm start\"", "\"cd client && npm start\""]
