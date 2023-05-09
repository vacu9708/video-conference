# Use the official Node.js 16 image as the base image
FROM node:16

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
#COPY client/package*.json /app/client/
#COPY server/package*.json /app/server/

# Install dependencies for both the client and server
#RUN cd client && npm install
#RUN cd server && npm install

# Copy the client and server source code to the working directory
COPY client/ /app/client/
COPY server/ /app/server/

# Build the client code
#RUN cd client && npm run build

# Set the environment variables for the server
ENV PORT=443
# Expose the port for the server
EXPOSE 443

# Start the server when the container is run
WORKDIR /app/server
CMD ["npm", "start"]
