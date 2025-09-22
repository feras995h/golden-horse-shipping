# Use Docker Compose for deployment
FROM docker:latest

# Copy docker-compose files
COPY docker-compose.yml docker-compose.prod.yml ./

# Set working directory
WORKDIR /app

# Copy application files
COPY . .

# Default command
CMD ["docker-compose", "up"]
