# Use official Node.js image (LTS version recommended)
FROM node:20


# Set the working directory inside the container
WORKDIR /app

# Set npm registry (fix for network issues)
RUN npm config set registry https://registry.npmjs.org/

# Set environment variables for development mode
ENV NODE_ENV=development

# Copy package.json and package-lock.json first (for caching)
COPY package.json package-lock.json* ./

# Install dependencies before copying source code (better caching)
RUN npm install --legacy-peer-deps

# Copy all project files (excluding node_modules via .dockerignore)
COPY . .

# Expose port for Vite development server
EXPOSE 5173

# Start Vite dev server (host mode allows external access)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
