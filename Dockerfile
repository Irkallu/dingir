# Stage 1 - Build

FROM node:14 AS build

WORKDIR /usr/src/app

COPY package.json package.json

RUN npm install

COPY . .

RUN npm run build

# Stage 2 - Dist Only

FROM node:14

WORKDIR /usr/src/app

COPY package.json package.json

RUN npm install --production

COPY --from=build /usr/src/app/dist dist

ENTRYPOINT npm start