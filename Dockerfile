# Use official Node.js image
FROM node:20

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the source code
COPY . .

# Build the TypeScript code (optional)
RUN npm run build

RUN cp -r src/delivery-service-connection/config dist/delivery-service-connection/

# Expose the order service port
EXPOSE 3007

# Start the service using ts-node
CMD ["node", "dist/server.js"]
