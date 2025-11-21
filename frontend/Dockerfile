FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install && npm install -g typescript

COPY . .

# Compilamos el TypeScript
RUN cd game && npx tsc

# --- STAGE 2: Nginx ---
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/ /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]