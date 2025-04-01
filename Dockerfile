# Use the official Nginx image from Docker Hub
FROM nginx:alpine

# Set a working directory inside the container
WORKDIR /app

# Copy your HTML and CSS files into the container's working directory
COPY . /app

# Expose port 80 to allow access to the server
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
