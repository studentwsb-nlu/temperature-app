# Używamy obrazu Node.js jako bazowego
FROM node:18-alpine

# Ustawienie katalogu roboczego w kontenerze
WORKDIR /app

# Kopiowanie pliku package.json i package-lock.json
COPY package*.json ./

# Instalowanie zależności
RUN npm install

# Kopiowanie reszty plików aplikacji do kontenera
COPY . .

# Otworzenie portu 5000
EXPOSE 5000

# Uruchomienie aplikacji
CMD ["npm", "start"]