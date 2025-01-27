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
RUN apt-get update && apt-get install -y curl sshpass && \
    curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb && \
    dpkg -i cloudflared.deb && \
    rm cloudflared.deb

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