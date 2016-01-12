FROM node:5.4

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy sources and dependencies
COPY . /usr/src/app

EXPOSE 8080

CMD [ "npm", "start" ]