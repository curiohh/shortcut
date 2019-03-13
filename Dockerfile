# Mac only: eval "$(docker-machine env default)"
# docker build -t tal-auth .
# docker run -p 3000:3000 -d tal-auth
# server will be running at docker-machine ip, i.e. http://192.168.99.100:3000/

FROM ubuntu:18.04
# RUN  apt-get install pkg-config libcairo2-dev libpango1.0-dev libssl-dev libjpeg62-dev libgif-dev build-essential

RUN apt-get update && \
        apt-get -y install curl libssl-dev git build-essential && \
        curl -sL https://deb.nodesource.com/setup_10.x | bash - && \
        apt-get install -y nodejs pkg-config libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev g++ ffmpeg && \
        apt-get clean

# Create app directory
RUN mkdir -p /usr/src/app
RUN mkdir -p /usr/src/server

# Install deps
WORKDIR /usr/src/app/server

COPY ./server/package.json .

RUN npm install canvas
RUN npm install
RUN npm audit fix --force

# Bundle app
COPY . /usr/src/app

EXPOSE 3000

CMD ["npm", "start"]
