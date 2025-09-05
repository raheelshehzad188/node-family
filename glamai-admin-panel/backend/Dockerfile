FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY . .

# Create necessary directories
RUN mkdir -p uploads/users uploads/garments uploads/general logs

# Expose port
EXPOSE 5000

# Start the application
CMD ["node", "src/server.js"]