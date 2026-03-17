FROM node:18-alpine

WORKDIR /app

# 🔥 Add this line
ENV NODE_OPTIONS="--experimental-global-webcrypto"

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main"]