# pull the official base image
FROM node:12-alpine

# set working direction
WORKDIR /chat-app-react
# add '/chat-app-react/node_modules/.bin' to $PATH
ENV PATH /chat-app-react/node_modules/.bin:$PATH

# install application dependencies
COPY package.json ./
COPY package-lock.json ./

RUN npm i
# add app
COPY . ./

# start app 
CMD ["npm", "start"]
EXPOSE 5000