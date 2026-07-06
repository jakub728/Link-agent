FROM mcr.microsoft.com/playwright:v1.61.0-jammy

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN mkdir -p public/uploads && chmod -R 777 public/uploads

COPY . .

RUN npm run build 

EXPOSE 5000

CMD ["node", "dist/server.js"]