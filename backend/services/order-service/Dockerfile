# 1. Build stage
FROM node:18 AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies (include devDependencies to build)
RUN npm install

# Copy toàn bộ source code
COPY . .

# Biên dịch TypeScript
RUN npm run build    # đảm bảo script "build" chạy `tsc`

# 2. Runtime stage
FROM node:18-slim

WORKDIR /usr/src/app

# Copy built files và node_modules từ builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./

EXPOSE 7004

# Chạy file JS đã biên dịch
CMD ["node", "dist/index.js"]
