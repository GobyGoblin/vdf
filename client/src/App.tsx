import React, { useState } from 'react';
import Globe from './components/Globe';
import './styles/globe.css';

export default function App() {
  const [markers] = useState([
    { lat: 37.7749, lon: -122.4194, color: 0x00ff00, size: 0.03 }, // San Francisco
    { lat: 51.5074, lon: -0.1278, color: 0xffff00, size: 0.03 }, // London
    { lat: -33.8688, lon: 151.2093, color: 0x00aaff, size: 0.03 }, // Sydney
    { lat: 52.52, lon: 13.405, color: 0xffd700, size: 0.03 }, // Berlin
    { lat: 34.0209, lon: -6.8416, color: 0xffd700, size: 0.03 }, // Rabat
  ]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Globe markers={markers} />
    </div>
  );
}
