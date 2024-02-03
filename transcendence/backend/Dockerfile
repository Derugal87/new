# Use the official Node.js image
FROM node:20

# Create and change to the app directory.
WORKDIR /usr/src/app

# Set the environment variable for NODE_ENV to 'test' for test features to work.
# Such as the mock authentication service.
# ENV NODE_ENV=test
# install yarn
# Install the NestJS CLI globally.
RUN yarn global add @nestjs/cli

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
COPY package*.json yarn.lock ./

# Install all dependencies, including development ones.
RUN yarn install

# Install TypeORM and its related type definitions.
RUN yarn add typeorm @nestjs/typeorm

# Install the PostgreSQL package
RUN yarn add pg

# Copy local code to the container image.
COPY . .

# Build the NestJS application
RUN yarn run build

# Expose the NestJS application's port
EXPOSE 4000

# Run the web service on container startup.
CMD [ "yarn", "start" ]
