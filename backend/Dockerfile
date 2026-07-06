FROM mcr.microsoft.com/playwright:v1.61.0-jammy

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build 

RUN mkdir -p public/uploads && chmod -R 777 public/uploads

EXPOSE 5000

CMD ["npm", "run", "open"]