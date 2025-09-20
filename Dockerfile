# Base image
FROM node:20.18.0

# Nastavení pracovního adresáře
WORKDIR /app

# Zkopírování balíčků a instalace závislostí pro React
COPY client/package*.json ./client/
RUN cd client && npm install

# Zkopírování celé React aplikace a její kompilace
COPY client ./client
RUN cd client && npm run build

# Zkopírování balíčků a instalace závislostí pro Express
COPY server/package*.json ./server/
RUN cd server && npm install

# Install cloudflared and sshpass
RUN apt-get update && apt-get install -y curl gnupg && \
    curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null && \
    echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/ $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/cloudflare.list && \
    apt-get update && apt-get install -y cloudflared sshpass

# Configure SSH
RUN mkdir -p /root/.ssh && \
    echo "Host mertalukas\n    HostName ssh.mertalukas.cz\n    ProxyCommand /usr/local/bin/cloudflared access ssh --hostname %h\n    User root\n" > /root/.ssh/config
RUN echo "Host sql.mertalukas.cz\n    HostName sql.mertalukas.cz\n    ProxyCommand /usr/local/bin/cloudflared access ssh --hostname %h\n    User root" >> /root/.ssh/config

# Přesun kompilovaných souborů z Reactu do veřejné složky serveru
RUN mkdir -p server/public && cp -r client/dist/* server/public/
#RUN cp -r client/dist/* server/

# Zkopírování celé serverové aplikace
COPY server ./server

# Nastavení pracovního adresáře na server a spuštění Express serveru
WORKDIR /app/server
CMD ["npm", "run", "start"]