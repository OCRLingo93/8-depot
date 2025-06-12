FROM node:18

# Installer tesseract et python
RUN apt-get update && \
    apt-get install -y tesseract-ocr python3 python3-pip && \
    ln -s /usr/bin/python3 /usr/bin/python

# Copie des fichiers
WORKDIR /app
COPY . .

# Installer les dépendances Node.js
RUN npm install

# Commande de démarrage (à adapter selon votre projet)
CMD ["npm", "start"]
