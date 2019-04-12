FROM node:8.15-alpine

WORKDIR /editor
COPY ./package.json .
RUN npm install 
COPY . .
EXPOSE 4001

CMD npm start
