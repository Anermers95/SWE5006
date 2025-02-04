FROM node:18.20.6-alpine3.21

# Set working directory
WORKDIR /app

# Remove any existing node_modules folder
RUN rm -rf node_modules package-lock.json

# Install esbuild globally (force rebuild of binaries)
RUN npm install -g esbuild --force

# Copy package.json
COPY package.json ./

# Install dependencies with better compatibility, skipping optional dependencies and with verbose logging
RUN npm install --legacy-peer-deps --no-optional --verbose

# Install rollup for docker only (Not sure why this is needed for linux)
RUN npm install rollup

# Copy the rest of the app
COPY . .

# Expose Vite's default port (5173)
EXPOSE 5173

# Start the app
CMD ["npm", "run", "dev"]
