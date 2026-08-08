# CODEBOX BACKEND
# Node.js + Python + GCC + Java

FROM node:22-bookworm-slim

# INSTALL COMPILERS / RUNTIMES
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        python3 \
        g++ \
        openjdk-17-jdk-headless \
        ca-certificates \
        && \
    rm -rf /var/lib/apt/lists/*

# VERIFY INSTALLATIONS
RUN node --version && \
    python3 --version && \
    g++ --version && \
    javac -version && \
    java -version

# CREATE APPLICATION DIRECTORY
WORKDIR /app

# COPY PACKAGE FILES FIRST
COPY package*.json ./

# INSTALL NODE DEPENDENCIES
RUN npm ci --omit=dev

# COPY BACKEND SOURCE
COPY . .

# CREATE TEMP DIRECTORY
RUN mkdir -p /tmp/codebox

# ENVIRONMENT
ENV NODE_ENV=production

# BACKEND PORT
EXPOSE 5000

# START SERVER
CMD ["node", "server.js"]