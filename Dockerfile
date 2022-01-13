# Stage 1 - Build

FROM node:16 AS build

WORKDIR /usr/src/app

COPY package.json package.json

RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev 

RUN npm install

COPY . .

RUN npm run build

# Stage 2 - Dist Only

FROM node:16

WORKDIR /usr/src/app

COPY package.json package.json

RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev 

RUN npm install --production

COPY --from=build /usr/src/app/dist dist

ENTRYPOINT npm start
