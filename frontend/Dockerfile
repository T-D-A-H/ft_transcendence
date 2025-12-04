FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install -D typescript tailwindcss postcss autoprefixer

COPY entrypoint-frontend.sh /usr/local/bin/entrypoint-frontend.sh
RUN chmod +x /usr/local/bin/entrypoint-frontend.sh


CMD ["tail", "-f", "/dev/null"]