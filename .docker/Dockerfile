# develop stage
FROM node:18-alpine as develop-stage
WORKDIR /app
# COPY package*.json ./
COPY . .
RUN npm install -g @quasar/cli
RUN npm install
RUN npx quasar build

# production stage
FROM nginx:1.17.5-alpine as production-stage
COPY --from=develop-stage /app/dist/spa /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
