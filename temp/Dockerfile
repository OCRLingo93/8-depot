FROM node:18

# Installer Tesseract et dépendances
RUN apt-get update && apt-get install -y tesseract-ocr

# Installer les dépendances Node
WORKDIR /app
COPY package*.json ./
RUN npm install

# Copier le reste du code
COPY . .

# Exposer le port
EXPOSE 3000

# Lancer l'app
CMD ["npm", "start"]
