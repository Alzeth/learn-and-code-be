FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

RUN npx prisma generate
RUN npm run build
RUN ls -la /app/dist/ || echo "dist folder is empty or missing"

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
