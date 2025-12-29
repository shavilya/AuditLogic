# Stage 1: Build the React Application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# ARG defines a variable that users can pass at build-time
# This is required because Vite "bakes" the env var into the static files
ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=${GEMINI_API_KEY}

# Build the static files (Output will be in /app/dist)
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built static assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 8080 (Matches the listen port in nginx.conf)
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]