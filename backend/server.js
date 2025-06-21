const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const https = require('https');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

// Połączenie z MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://mongo:27017/temperatures';
console.log('Łączenie z MongoDB:', mongoUri);

mongoose.connect(mongoUri)
  .then(() => console.log('✅ Połączono z MongoDB'))
  .catch(err => console.error('❌ Błąd MongoDB:', err));

const Temp = mongoose.model('Temperature', {
  temperature: Number,
  device: String,
  timestamp: { type: Date, default: Date.now }
});

// REST API endpoints
app.get('/', (req, res) => {
  res.json({ 
    message: 'Serwer temperatury działa!',
    timestamp: new Date().toISOString(),
    endpoints: ['/api/temperatures', '/api/temperatures (POST)']
  });
});

app.get('/api/temperatures', async (req, res) => {
  try {
    const temps = await Temp.find().sort({ timestamp: -1 }).limit(50);
    console.log(`📊 Pobrano ${temps.length} temperatur`);
    res.json(temps);
  } catch (error) {
    console.error('❌ Błąd API:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint do dodawania nowych temperatur
app.post('/api/temperatures', async (req, res) => {
  try {
    const { temperature, device } = req.body;
    
    if (!temperature || !device) {
      return res.status(400).json({ error: 'Brak wymaganych pól: temperature, device' });
    }
    
    const temp = new Temp({ temperature, device });
    await temp.save();
    console.log(`🌡️ Dodano temperaturę: ${device} - ${temperature}°C`);
    res.json(temp);
  } catch (error) {
    console.error('❌ Błąd dodawania:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint do generowania testowych danych
app.post('/api/generate-test-data', async (req, res) => {
  try {
    const devices = ['Salon', 'Kuchnia', 'Sypialnia', 'Łazienka', 'Biuro'];
    const testData = [];
    
    for (let i = 0; i < 20; i++) {
      const temp = new Temp({
        temperature: Math.round((Math.random() * 15 + 15) * 10) / 10, // 15-30°C
        device: devices[Math.floor(Math.random() * devices.length)],
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // ostatnie 7 dni
      });
      await temp.save();
      testData.push(temp);
    }
    
    console.log(`🧪 Wygenerowano ${testData.length} testowych temperatur`);
    res.json({ message: `Dodano ${testData.length} testowych rekordów`, data: testData });
  } catch (error) {
    console.error('❌ Błąd generowania danych:', error);
    res.status(500).json({ error: error.message });
  }
});

// Wczytaj certyfikaty HTTPS
const privateKey = fs.readFileSync('./certs/server.key', 'utf8');
const certificate = fs.readFileSync('./certs/server.crt', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Generowanie losowego tokena Bearer
const TOKEN = crypto.randomBytes(32).toString('hex');
console.log('\uD83D\uDD11 Twój Bearer token:', TOKEN);

// Middleware do autoryzacji Bearer
app.use((req, res, next) => {
  // Pozwól na dostęp do root bez tokena (np. info o API)
  if (req.path === '/' || req.path === '/favicon.ico') return next();
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ') || auth.split(' ')[1] !== TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', async ws => {
  console.log('🔌 Nowe połączenie WebSocket');

  try {
    const temps = await Temp.find().sort({ timestamp: 1 });
    let index = 0;

    // Wysyłaj dane co 3 sekundy
    const interval = setInterval(() => {
      if (index >= temps.length) {
        // Jeśli skończyły się dane, wyślij losową temperaturę
        const devices = ['Salon', 'Kuchnia', 'Sypialnia', 'Łazienka', 'Biuro'];
        const randomTemp = {
          temperature: Math.round((Math.random() * 15 + 15) * 10) / 10,
          device: devices[Math.floor(Math.random() * devices.length)],
          timestamp: new Date()
        };
        ws.send(JSON.stringify(randomTemp));
        console.log(`📡 Wysłano losową temperaturę: ${randomTemp.device} - ${randomTemp.temperature}°C`);
      } else {
        ws.send(JSON.stringify(temps[index]));
        console.log(`📡 Wysłano temperaturę ${index + 1}/${temps.length}`);
        index++;
      }
    }, 3000);

    ws.on('close', () => {
      console.log('🔌 Połączenie WebSocket zamknięte');
      clearInterval(interval);
    });

    ws.on('error', (error) => {
      console.error('❌ Błąd WebSocket:', error);
      clearInterval(interval);
    });
  } catch (error) {
    console.error('❌ Błąd inicjalizacji WebSocket:', error);
  }
});

// Zamiast http.createServer, uruchom serwer HTTPS
https.createServer(credentials, app).listen(443, () => {
  console.log('Serwer HTTPS działa na porcie 443');
});

// Jeśli chcesz, możesz wyłączyć nasłuchiwanie na porcie 5000 (usuń http.createServer lub app.listen)