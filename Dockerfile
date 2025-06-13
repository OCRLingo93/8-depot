FROM node:18

# Installer tesseract, python, pip
RUN apt-get update && \
    apt-get install -y tesseract-ocr python3 python3-pip python-is-python3

# Définir le répertoire de travail
WORKDIR /app

# Copier tous les fichiers dans le conteneur
COPY . .

# Installer les dépendances Python
RUN pip install -r requirements.txt

# Installer les dépendances Node.js
RUN npm install

# Lancer l'application
CMD ["npm", "start"]
