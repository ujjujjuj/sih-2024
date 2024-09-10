FROM node:18-alpine


WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . . 

ARG backend_url
ENV NEXT_PUBLIC_BACKEND_URL=$backend_url

RUN npm run build

CMD ["npm", "run", "start"]