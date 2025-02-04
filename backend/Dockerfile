FROM node:18

# Set working directory
WORKDIR /app

# Remove any existing node_modules folder
RUN rm -rf node_modules package-lock.json

# Copy package.json and package-lock.json
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose port 3000
EXPOSE 3000

# Run the application
CMD ["node", "index.js"]
