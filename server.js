// server.js
const express  = require('express');
const { execSync } = require('child_process');

// Port et GPIO chip
const PORT = 8080;
const CHIP = 'gpiochip0';

// Mapping BCM ↔ boutons Mega Drive
const MAP = {
  U:  4,  // Up
  D: 17,  // Down
  L: 27,  // Left
  R: 22,  // Right
  X: 23,  // X
  Y: 24,  // Y
  Z: 25,  // Z
  A:  5,  // A
  B:  6,  // B
  C: 13,  // C
  S: 16,  // Start
  M: 26   // Mode
};

// Fonction synchrone gpioset
function setLineSync(gpio, value) {
  try {
    execSync(`gpioset ${CHIP} ${gpio}=${value}`, { stdio: 'ignore' });
  } catch (err) {
    console.error(`gpioset error GPIO${gpio}=${value}: ${err.message.trim()}`);
  }
}

// Express
const app = express();
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Healthcheck
app.get('/health', (req, res) => {
  res.send('MD Pad Server OK');
});

// Bouton pressé → ligne HIGH
app.post('/down', (req, res) => {
  const btn = (req.body.btn||'').toUpperCase();
  const gpio = MAP[btn];
  if (gpio === undefined) return res.status(400).send('Unknown button');
  console.log(`⭆ DOWN  (${btn}) → GPIO${gpio}=1`);
  setLineSync(gpio, 1);
  res.sendStatus(204);
});

// Bouton relâché → ligne LOW
app.post('/up', (req, res) => {
  const btn = (req.body.btn||'').toUpperCase();
  const gpio = MAP[btn];
  if (gpio === undefined) return res.status(400).send('Unknown button');
  console.log(`⭆ UP    (${btn}) → GPIO${gpio}=0`);
  setLineSync(gpio, 0);
  res.sendStatus(204);
});

// Démarrage du serveur
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`MD pad server listening on http://0.0.0.0:${PORT}`);
});
server.on('error', err => {
  console.error('❌ Server error:', err);
});

// Cleanup SIGINT
process.on('SIGINT', () => {
  console.log('\n🔌 Cleaning up GPIO lines…');
  for (const gpio of Object.values(MAP)) {
    setLineSync(gpio, 0);
  }
  process.exit();
});
