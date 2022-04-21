FROM node:17-alpine

WORKDIR /srv

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=3001

EXPOSE 3001

CMD ["npm", "start"]

# COPY package.json yarn.lock ./
# RUN yarn install --production