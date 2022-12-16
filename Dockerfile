FROM node:14.20.0

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . ./

CMD ["npm", "run", "start"]