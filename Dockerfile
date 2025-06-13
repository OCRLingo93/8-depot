FROM node:18

# Installer tesseract, python et créer l'alias python → python3
RUN apt-get update && \
    apt-get install -y tesseract-ocr python3 python3-pip python-is-python3

# Créer le répertoire de travail
WORKDIR /app

# Copier les fichiers
COPY . .

# Installer les dépendances Node.js
RUN npm install

# Lancer l'application
CMD ["npm", "start"]
