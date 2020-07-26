FROM node:8-alpine

COPY . /app

WORKDIR /app

RUN pwd

RUN npm install

EXPOSE 3000

CMD [ "node", "server.js" ]