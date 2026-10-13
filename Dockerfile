# ---- dev: hot reload ----
FROM node:20-alpine AS dev
WORKDIR /app
RUN npm i -g live-server
COPY . .
EXPOSE 8080
CMD ["live-server","--port=8080","--host=0.0.0.0","--no-browser"]

# ---- prod: optimized static ----
FROM nginx:alpine AS prod
COPY index.html manifest.json sw.js icon.svg /usr/share/nginx/html/
COPY css /usr/share/nginx/html/css
COPY js /usr/share/nginx/html/js
RUN printf 'server{listen 80;root /usr/share/nginx/html;gzip on;gzip_types text/css application/javascript application/json image/svg+xml;location /sw.js{add_header Cache-Control no-cache;}}' > /etc/nginx/conf.d/default.conf
EXPOSE 80
