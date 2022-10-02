FROM node:16.14.2-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --silent
RUN npm install -g ts-node

COPY . .

EXPOSE 5000

CMD ["npm","start"]