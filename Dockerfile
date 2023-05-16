# Use the official Node.js image as a parent image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Install FFmpeg
RUN apt-get update && apt-get install -y ffmpeg

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Bundle app source
COPY . .

# Run the app when the container launches
CMD [ "node", "index.js" ]
