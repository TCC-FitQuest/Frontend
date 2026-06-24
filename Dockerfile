FROM node:22-bookworm-slim AS runtime

ENV EXPO_NO_TELEMETRY=1

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 8081 19000 19001 19002

CMD ["npm", "run", "docker:web"]
