FROM node:25.2.1

WORKDIR /app

COPY api/package*.json ./
RUN npm install --production

COPY api/ ./

EXPOSE 3000

CMD ["npm", "start"]
