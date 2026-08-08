# CODEBOX FRONTEND
FROM nginx:alpine

# REMOVE DEFAULT NGINX PAGE
RUN rm -rf /usr/share/nginx/html/*

# COPY FRONTEND FILES
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/

# COPY NGINX CONFIGURATION
COPY nginx.conf /etc/nginx/conf.d/default.conf

# EXPOSE HTTP
EXPOSE 80

# START NGINX
CMD ["nginx", "-g", "daemon off;"]