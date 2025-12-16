# 1️⃣ Base image
FROM node:20-alpine AS builder

WORKDIR /app

# 2️⃣ Install dependencies
COPY package*.json ./
RUN npm install

# 3️⃣ Copy source
COPY . .

# 4️⃣ Build Next.js
RUN npm run build


# 5️⃣ Production image
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy build artifacts
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["npm", "run", "start"]
