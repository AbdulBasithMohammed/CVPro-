FROM node:18-alpine

WORKDIR /app

COPY . /app
RUN npm install webpack@4.42.0
# Install dependencies
RUN npm install

# Build the React application
# RUN export CI=false
RUN NODE_OPTIONS="--openssl-legacy-provider" npm run build


ARG PORT=3000
ARG REACT_APP_BACKEND_BASE_URL

ENV PORT=$PORT
ENV REACT_APP_BACKEND_BASE_URL=$REACT_APP_BACKEND_BASE_URL

# Expose the desired port
EXPOSE $PORT

# Use 'serve' to serve the production build on port 3000
CMD ["sh", "-c", "PORT=$PORT REACT_APP_BACKEND_BASE_URL=$REACT_APP_BACKEND_BASE_URL npm start"]
