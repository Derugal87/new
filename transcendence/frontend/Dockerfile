# Use the official Node.js 14 image.
# https://hub.docker.com/_/node
FROM node:20

# Create and change to the app directory.
WORKDIR /transcendence/frontend

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
COPY package*.json yarn.lock ./

ENV PATH /app/node_modules/.bin:$PATH

# Install production dependencies.
# If you have native dependencies, you'll need additional tools.
# Check out the full Docker guide: https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
RUN yarn install --only=production

# Copy local code to the container image.
COPY . .

# Expose the NestJS application's port
EXPOSE 3000

# Run the web service on container startup.
# CMD [ "npm" , "run", "start:prod" ]

CMD yarn start --host 0.0.0.0 --port 3000 --disableHostCheck true
