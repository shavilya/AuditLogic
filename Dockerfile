# Stage 1: Build the React app
# We use Node 20 Alpine as requested
FROM node:20-alpine as builder

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your project files
COPY . .

# Accept the API Key as a build argument
ARG GEMINI_API_KEY

# Write the key to .env.local
# We add "VITE_" because Vite usually requires this prefix to see variables
RUN echo "VITE_GEMINI_API_KEY=$GEMINI_API_KEY" > .env.local
# We also add it without the prefix just in case your code looks for that
RUN echo "GEMINI_API_KEY=$GEMINI_API_KEY" >> .env.local

# Build the app (creates the 'dist' folder)
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy the build output from the previous stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080 (Required by Cloud Run)
EXPOSE 8080

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]