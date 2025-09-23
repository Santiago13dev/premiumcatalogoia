FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm ci --only=production
RUN cd server && npm ci --only=production

# Copy application files
COPY . .

# Build frontend
RUN npm run build

# Expose ports
EXPOSE 3000

# Start server
CMD ["npm", "run", "start"]