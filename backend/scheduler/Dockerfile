FROM node:alpine
WORKDIR /usr/scheduler
COPY package*.json .
RUN npm i
COPY . .
COPY tsconfig.json .
RUN npm run build
CMD [ "node", "dist/scheduler.js"]