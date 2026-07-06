FROM mcr.microsoft.com/playwright:v1.61.0-jammy

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build 

RUN echo "--- ZAWARTOŚĆ FOLDERU DIST ---" && ls -R /app/dist && echo "-------------------------------"

RUN mkdir -p public/uploads && chmod -R 777 public/uploads

EXPOSE 5000

CMD ["npm", "run", "open"]