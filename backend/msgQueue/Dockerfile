FROM node:alpine
WORKDIR /usr/msgQueue
COPY package*.json .
RUN npm i
COPY . .
COPY tsconfig.json .
RUN npm run build
CMD [ "node", "dist/consumer.js"]

