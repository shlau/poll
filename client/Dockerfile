FROM node:22.15.0-bullseye

WORKDIR /usr/src/app

COPY package*.json ./

RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm && \
    npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]