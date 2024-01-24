FROM node:alpine
WORKDIR /usr/api
COPY package*.json .
RUN npm i
COPY . .
COPY tsconfig.json .
RUN npm run build
CMD [ "npm", "start"]
