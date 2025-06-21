# 🌡️ Monitor Temperatury - Aplikacja Docker

Kompletna aplikacja do monitorowania temperatury w czasie rzeczywistym z użyciem Docker, Node.js, React, MongoDB i WebSocket.

## 🆕 Nowości: HTTPS i Bearer Token

Od wersji 1.1 aplikacja obsługuje połączenia HTTPS oraz kontrolę dostępu przez token Bearer:
- Backend działa przez HTTPS (port 443) z własnym certyfikatem.
- Każde żądanie do API wymaga nagłówka `Authorization: Bearer <token>`.
- Token generowany jest automatycznie przy starcie backendu i wyświetlany w logach.
- Frontend pobiera token z pliku `.env` i automatycznie dołącza go do zapytań.

## ⚡️ Ważne przed uruchomieniem!

**Przed pierwszym uruchomieniem musisz wygenerować certyfikat i klucz dla HTTPS:**

```bash
mkdir -p backend/certs
openssl req -x509 -newkey rsa:4096 -keyout backend/certs/server.key -out backend/certs/server.crt -days 365 -nodes -subj "/CN=localhost"
```

Pliki `server.key` i `server.crt` muszą znajdować się w katalogu `backend/certs/`.

---

## 📋 Wymagania

- Docker
- Docker Compose
- Porty: 3000 (frontend), 443 (backend), 27017 (MongoDB)

## 🚀 Szybkie uruchomienie

### 1. Przygotowanie struktury

Utwórz następującą strukturę katalogów:

```
temperature-app/
├── docker-compose.yml
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── Dockerfile
│   └── certs/
│       ├── server.key
│       └── server.crt
└── frontend/
    ├── src/
    │   ├── App.js
    │   └── index.js
    ├── public/
    │   └── index.html
    ├── package.json
    ├── nginx.conf
    └── Dockerfile
```

### 2. Skopiuj pliki

Skopiuj wszystkie pliki z artefaktów do odpowiednich lokalizacji zgodnie ze strukturą powyżej.

### 3. Uruchomienie

**Przed uruchomieniem po raz pierwszy wygeneruj certyfikat i klucz dla HTTPS:**

```bash
mkdir -p backend/certs
openssl req -x509 -newkey rsa:4096 -keyout backend/certs/server.key -out backend/certs/server.crt -days 365 -nodes -subj "/CN=localhost"
```

Pliki `server.key` i `server.crt` muszą znajdować się w katalogu `backend/certs/`.

```bash
# Przejdź do głównego katalogu
cd temperature-app

# Uruchom wszystkie serwisy
docker-compose up --build

# Lub w tle:
docker-compose up -d --build
```

### 4. Dostęp do aplikacji

- **Frontend:** http://localhost:3000
- **Backend API:** https://localhost:443
- **MongoDB:** localhost:27017

## 🧪 Testowanie

### Generowanie danych testowych
1. Otwórz aplikację w przeglądarce
2. Kliknij "Generuj dane testowe"
3. Poczekaj na przeładowanie strony

### Ręczne dodawanie danych
```bash
curl -X POST http://localhost:5000/api/generate-test-data
```

### Dodawanie pojedynczego odczytu
```bash
curl -X POST http://localhost:5000/api/temperatures \
  -H "Content-Type: application/json" \
  -d '{"temperature": 23.5, "device": "Salon"}'
```

## 📊 Funkcjonalności

### Backend
- ✅ REST API do pobierania i dodawania temperatur
- ✅ WebSocket do transmisji w czasie rzeczywistym
- ✅ Połączenie z MongoDB
- ✅ Generator danych testowych
- ✅ Walidacja danych
- ✅ Obsługa błędów

### Frontend
- ✅ Interfejs React z nowoczesnym designem
- ✅ Połączenie WebSocket z statusem
- ✅ Statystyki urządzeń
- ✅ Responsive design
- ✅ Automatyczne odświeżanie danych
- ✅ Dodawanie ręcznych odczytów
- ✅ Kolorowe oznaczenia temperatur

### MongoDB
- ✅ Automatyczne uruchomienie w kontenerze
- ✅ Trwałe przechowywanie danych
- ✅ Indeksowanie po czasie

## 🔧 Komendy Docker

### Podstawowe operacje
```bash
# Uruchomienie
docker-compose up --build

# Uruchomienie w tle
docker-compose up -d --build

# Zatrzymanie
docker-compose down

# Zatrzymanie z usunięciem danych
docker-compose down -v

# Sprawdzenie statusu
docker-compose ps

# Logi wszystkich serwisów
docker-compose logs

# Logi konkretnego serwisu
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongo
```

### Debugowanie
```bash
# Wejście do kontenera backend
docker-compose exec backend sh

# Wejście do kontenera MongoDB
docker-compose exec mongo mongosh

# Restart konkretnego serwisu
docker-compose restart backend
```

## 🗄️ API Endpoints

### GET /api/temperatures
Pobiera listę wszystkich temperatur (max 50 najnowszych)
```bash
curl http://localhost:5000/api/temperatures
```

### POST /api/temperatures
Dodaje nowy odczyt temperatury
```bash
curl -X POST http://localhost:5000/api/temperatures \
  -H "Content-Type: application/json" \
  -d '{"temperature": 25.3, "device": "Kuchnia"}'
```

### POST /api/generate-test-data
Generuje 20 losowych odczytów temperatury
```bash
curl -X POST http://localhost:5000/api/generate-test-data
```

### GET /
Status serwera i lista dostępnych endpoints
```bash
curl http://localhost:5000/
```

## 🔌 WebSocket

WebSocket automatycznie wysyła nowe dane co 3 sekundy:
- Jeśli są dane w bazie - wysyła kolejno wszystkie
- Po wysłaniu wszystkich - generuje losowe temperatury

Połączenie: `ws://localhost:5000`

## 🐛 Rozwiązywanie problemów

### Problem: Brak połączenia z MongoDB
```bash
# Sprawdź czy kontener MongoDB działa
docker-compose ps

# Sprawdź logi
docker-compose logs mongo

# Restart MongoDB
docker-compose restart mongo
```

### Problem: Frontend nie łączy się z backendem
1. Sprawdź czy backend działa: http://localhost:5000
2. Sprawdź logi: `docker-compose logs backend`
3. Sprawdź konfigurację nginx w frontend/nginx.conf

### Problem: WebSocket nie działa
1. Sprawdź czy backend nasłuchuje na WebSocket
2. Sprawdź logi przeglądarki (F12 -> Console)
3. Sprawdź czy port 5000 jest dostępny

### Problem: Porty zajęte
```bash
# Zmień porty w docker-compose.yml
# Przykład: zmień "3000:80" na "3001:80"
```

## 🔒 Bezpieczeństwo

### Produkcja
Przed wdrożeniem na produkcję:

1. **Zmień dane MongoDB:**
```yaml
environment:
  MONGO_INITDB_ROOT_USERNAME: admin
  MONGO_INITDB_ROOT_PASSWORD: twoje-bezpieczne-haslo
```

2. **Użyj HTTPS:**
- Skonfiguruj SSL w nginx
- Użyj wss:// zamiast ws:// dla WebSocket

3. **Dodaj zmienne środowiskowe:**
```yaml
environment:
  - NODE_ENV=production
  - JWT_SECRET=twoj-klucz-jwt
```

## 📈 Rozszerzenia

### Dodawanie nowych funkcji

1. **Alerty temperatury:**
   - Dodaj endpoint dla konfiguracji alertów
   - Implementuj sprawdzanie progów
   - Dodaj powiadomienia email/SMS

2. **Wykresy:**
   - Dodaj bibliotekę Chart.js
   - Stwórz komponenty wykresów
   - Implementuj filtry czasowe

3. **Użytkownicy:**
   - Dodaj autoryzację JWT
   - Stwórz system ról
   - Dodaj panel administratora

4. **API dla urządzeń IoT:**
   - Dodaj endpoint z autoryzacją API key
   - Implementuj rate limiting
   - Dodaj walidację urządzeń

## 📝 Struktura bazy danych

### Kolekcja: temperatures
```javascript
{
  _id: ObjectId,
  temperature: Number,    // Temperatura w °C
  device: String,         // Nazwa urządzenia
  timestamp: Date         // Czas odczytu
}
```

### Indeksy
```javascript
// Indeks na timestamp dla szybkiego sortowania
db.temperatures.createIndex({ "timestamp": -1 })

// Indeks składany dla zapytań po urządzeniu i czasie
db.temperatures.createIndex({ "device": 1, "timestamp": -1 })
```

## 🎯 Monitoring

### Logi aplikacji
```bash
# Wszystkie logi
docker-compose logs -f

# Tylko błędy
docker-compose logs | grep ERROR

# Logi z czasem
docker-compose logs -t
```

### Metryki MongoDB
```bash
# Wejdź do MongoDB
docker-compose exec mongo mongosh

# Sprawdź statystyki
db.temperatures.stats()

# Sprawdź liczbę dokumentów
db.temperatures.countDocuments()

# Najnowsze dokumenty
db.temperatures.find().sort({timestamp: -1}).limit(5)
```

## 🚀 Deployment

### Docker Hub
```bash
# Zbuduj i wypchnij obrazy
docker build -t yourusername/temp-backend ./backend
docker build -t yourusername/temp-frontend ./frontend

docker push yourusername/temp-backend
docker push yourusername/temp-frontend
```

### Docker Swarm
```bash
# Inicjalizuj swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml temp-app
```

## 📞 Wsparcie

W przypadku problemów:
1. Sprawdź logi: `docker-compose logs`
2. Sprawdź status kontenerów: `docker-compose ps`
3. Restartuj aplikację: `docker-compose restart`
4. Usuń i uruchom ponownie: `docker-compose down && docker-compose up --build`

---

**Autor:** 30673  
**Wersja:** 1.0.0  
**Licencja:** ISC