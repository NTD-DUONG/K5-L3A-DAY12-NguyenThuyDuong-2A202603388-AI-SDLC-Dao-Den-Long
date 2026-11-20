FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
ENV HOST=0.0.0.0
ENV PORT=5173
VOLUME ["/app/data"]
EXPOSE 5173
CMD ["node","scripts/serve.mjs"]
