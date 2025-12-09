FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

COPY entrypoint-blockchain.sh /app/entrypoint-blockchain.sh
RUN chmod +x /app/entrypoint-blockchain.sh

EXPOSE 8545

ENTRYPOINT ["/app/entrypoint-blockchain.sh"]
