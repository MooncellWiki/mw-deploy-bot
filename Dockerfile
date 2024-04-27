FROM node:20-bookworm-slim

WORKDIR /

COPY ./dist/index.js /index.js

ENTRYPOINT ["node", "/index.js"]