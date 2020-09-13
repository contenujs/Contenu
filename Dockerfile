FROM node:10
WORKDIR /app
COPY package.json .
RUN yarn
COPY . .
RUN yarn front-build
EXPOSE 8080
CMD [ "node", "index.js" ]
