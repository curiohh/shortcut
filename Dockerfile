# Mac only: eval "$(docker-machine env default)"
# docker build -t tal-auth .
# docker run -p 3000:3000 -d tal-auth
# server will be running at docker-machine ip, i.e. http://192.168.99.100:3000/

FROM node:10

# Create app directory
RUN mkdir -p /usr/src/app
RUN mkdir -p /usr/src/server

# Install deps
WORKDIR /usr/src/app/server

copy ./server/package.json .
RUN npm install

# Bundle app
COPY . /usr/src/app

EXPOSE 3000

CMD [ "npm", "start" ]
