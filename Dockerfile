FROM node:lts as builder
RUN mkdir /app && chown -R node:node /app
WORKDIR '/app'
COPY ./package.json ./
COPY ./package-lock.json ./
USER node
RUN npm ci --only=production
COPY --chown=node:node . /app/
EXPOSE 4001
CMD npm run start
