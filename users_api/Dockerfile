FROM node:17-alpine

WORKDIR /srv

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=4000

EXPOSE 4000

CMD ["npm", "start"]

# COPY package.json yarn.lock ./
# RUN yarn install --production