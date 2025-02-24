FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy all files to the container
COPY . /app

# Install Webpack (specific version)
RUN npm install webpack@4.42.0

# Install dependencies
RUN npm install

# Define build arguments
ARG PORT=3000
ARG REACT_APP_BACKEND_BASE_URL

# Set environment variables
ENV PORT=$PORT
ENV REACT_APP_BACKEND_BASE_URL=$REACT_APP_BACKEND_BASE_URL

# Build the React application with the backend URL
RUN NODE_OPTIONS="--openssl-legacy-provider" REACT_APP_BACKEND_BASE_URL=$REACT_APP_BACKEND_BASE_URL npm run build

# Install 'serve' to serve the built application
RUN npm install -g serve

# Expose the desired port
EXPOSE $PORT

# Use 'serve' to serve the production build on the specified port
CMD ["sh", "-c", "serve -s build -l $PORT"]
