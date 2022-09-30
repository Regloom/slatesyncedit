FROM node:alpine as builder
WORKDIR '/app'
COPY ./package*.json ./
RUN npm install
COPY ./ ./
RUN npm run build

FROM node:alpine
WORKDIR '/app'
COPY --from=builder /app/build ./build
COPY ./server/package*.json ./
RUN npm install
COPY ./server ./
CMD [ "npm" , "run" , "serve"]

