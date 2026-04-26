# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose backend port
EXPOSE 5000

# Start command
CMD ["npm", "start"]
