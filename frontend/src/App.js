import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [temps, setTemps] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState({ total: 0, devices: [] });

  useEffect(() => {
    // Pobierz dane z REST API
    const fetchTemperatures = async () => {
      try {
        const response = await axios.get('/api/temperatures');
        setTemps(response.data);
        
        // Oblicz statystyki
        const deviceStats = response.data.reduce((acc, temp) => {
          acc[temp.device] = acc[temp.device] || [];
          acc[temp.device].push(temp.temperature);
          return acc;
        }, {});
        
        const deviceList = Object.keys(deviceStats).map(device => ({
          name: device,
          count: deviceStats[device].length,
          avg: (deviceStats[device].reduce((a, b) => a + b, 0) / deviceStats[device].length).toFixed(1),
          min: Math.min(...deviceStats[device]),
          max: Math.max(...deviceStats[device])
        }));
        
        setStats({
          total: response.data.length,
          devices: deviceList
        });
      } catch (err) {
        console.error('Błąd API:', err);
      }
    };

    fetchTemperatures();

    // Połączenie WebSocket
    const wsUrl = `ws://localhost:5000`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket połączony');
    };

    ws.onmessage = event => {
      const data = JSON.parse(event.data);
      setTemps(prev => [data, ...prev].slice(0, 20));
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket rozłączony');
    };

    ws.onerror = (error) => {
      console.error('Błąd WebSocket:', error);
    };

    return () => ws.close();
  }, []);

  const generateTestData = async () => {
    try {
      await axios.post('/api/generate-test-data');
      window.location.reload(); // Przeładuj stronę aby zobaczyć nowe dane
    } catch (error) {
      console.error('Błąd generowania danych:', error);
    }
  };

  const addManualReading = async () => {
    const device = prompt('Nazwa urządzenia:');
    const temperature = prompt('Temperatura (°C):');
    
    if (device && temperature) {
      try {
        await axios.post('/api/temperatures', {
          device,
          temperature: parseFloat(temperature)
        });
      } catch (error) {
        console.error('Błąd dodawania:', error);
      }
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          color: '#2c3e50',
          textAlign: 'center',
          marginBottom: '30px',
          fontSize: '2.5em'
        }}>
          🌡️ Monitor Temperatury
        </h1>
        
        {/* Status połączenia */}
        <div style={{ 
          padding: '15px', 
          backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
          border: `2px solid ${isConnected ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center',
          fontSize: '1.1em'
        }}>
          <strong>Status WebSocket:</strong> {isConnected ? '🟢 Połączony' : '🔴 Rozłączony'}
        </div>

        {/* Przyciski akcji */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '30px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={generateTestData}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            🧪 Generuj dane testowe
          </button>
          <button 
            onClick={addManualReading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ➕ Dodaj odczyt
          </button>
        </div>

        {/* Statystyki */}
        {stats.devices.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#2c3e50' }}>📊 Statystyki</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '15px',
              marginBottom: '20px'
            }}>
              {stats.devices.map((device, i) => (
                <div key={i} style={{
                  padding: '15px',
                  backgroundColor: '#e3f2fd',
                  border: '1px solid #bbdefb',
                  borderRadius: '8px'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>
                    📱 {device.name}
                  </h4>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    <div>Odczytów: <strong>{device.count}</strong></div>
                    <div>Średnia: <strong>{device.avg}°C</strong></div>
                    <div>Min/Max: <strong>{device.min}°C / {device.max}°C</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Lista temperatur */}
        <h2 style={{ color: '#2c3e50' }}>📋 Ostatnie odczyty ({temps.length})</h2>
        
        {temps.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666',
            fontSize: '18px'
          }}>
            Brak danych. Kliknij "Generuj dane testowe" aby dodać przykładowe temperatury.
          </div>
        ) : (
          <div style={{
            maxHeight: '500px',
            overflowY: 'auto',
            border: '1px solid #dee2e6',
            borderRadius: '8px'
          }}>
            {temps.map((t, i) => (
              <div key={i} style={{
                padding: '15px',
                borderBottom: i < temps.length - 1 ? '1px solid #eee' : 'none',
                backgroundColor: i % 2 === 0 ? '#f8f9fa' : 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong style={{ fontSize: '18px', color: '#2c3e50' }}>
                    📱 {t.device}
                  </strong>
                  <div style={{ 
                    fontSize: '24px', 
                    color: t.temperature > 25 ? '#dc3545' : t.temperature < 18 ? '#007bff' : '#28a745',
                    fontWeight: 'bold'
                  }}>
                    {t.temperature}°C
                  </div>
                </div>
                <div style={{ 
                  textAlign: 'right',
                  color: '#6c757d',
                  fontSize: '14px'
                }}>
                  <div>🕐 {new Date(t.timestamp).toLocaleDateString()}</div>
                  <div>{new Date(t.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;