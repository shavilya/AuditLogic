# --- Stage 1: Build the App ---
# Use Node 20 on Alpine Linux (a very small, fast OS)
FROM node:20-alpine as build

# Set the folder where we work inside the container
WORKDIR /app

# Copy package files first to install dependencies (better for caching)
COPY package*.json ./

# Install the dependencies
RUN npm install

# 1. Accept the API Key from the build command
ARG GEMINI_API_KEY

# 2. Write it into a .env.local file so Vite can use it
# Note: We add "VITE_" because Vite only reads variables starting with VITE_
RUN echo "VITE_GEMINI_API_KEY=$GEMINI_API_KEY" > .env.local

# Copy the rest of your app source code
COPY . .

# Build the app (creates the 'dist' folder)
RUN npm run build

# --- Stage 2: Serve the App ---
# Use Nginx to serve the static files (lightweight web server)
FROM nginx:alpine

# Copy the built files from the previous stage to Nginx's html folder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy our custom Nginx config (see below)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Tell Google Cloud Run we are listening on port 8080
EXPOSE 8080

# Start Nginx in the foreground so the container keeps running
CMD ["nginx", "-g", "daemon off;"]
