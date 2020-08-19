FROM node:10
WORKDIR /app
COPY package.json package.json
RUN npm install
COPY . .
RUN npm run front-build
EXPOSE 8080
CMD [ "node", "index.js" ]
