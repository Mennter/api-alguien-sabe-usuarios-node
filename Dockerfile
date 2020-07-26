FROM node:8-alpine

COPY . /app

WORKDIR /app

RUN pwd

RUN npm install @elastic/elasticsearch

EXPOSE 3000

CMD [ "node", "server.js" ]