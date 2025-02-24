FROM node:18-alpine

WORKDIR /app

COPY . /app

# Install dependencies
RUN npm install

# Build the React application
RUN npm run build

# Install the 'serve' package to serve the production build
RUN npm install -g serve

# Expose the desired port
EXPOSE 3000

# Set the environment variable to allow binding to all IPs
ENV HOST=0.0.0.0

# Use 'serve' to serve the production build on port 3000
CMD ["serve", "-s", "build", "-l", "3000"]
