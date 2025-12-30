FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

COPY entrypoint-blockchain.sh /app/entrypoint-blockchain.sh
RUN chmod +x /app/entrypoint-blockchain.sh

EXPOSE 8545

ENV NODE_ENV=production

ENTRYPOINT ["/app/entrypoint-blockchain.sh"]
