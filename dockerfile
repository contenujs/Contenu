FROM alpine-node:10.22
WORKDIR /app
COPY package.json .
RUN yarn
COPY . .
RUN yarn front-build
EXPOSE 8080
CMD [ "node", "index.js" ]
