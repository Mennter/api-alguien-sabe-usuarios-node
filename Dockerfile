FROM node:8-alpine

COPY . /app

WORKDIR /app

RUN pwd

EXPOSE 3000

CMD [ "node", "server.js" ]