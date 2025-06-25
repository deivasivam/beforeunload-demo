const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware for JSON parsing
app.use(express.json());

// ✅ CORS setup: reflect origin and allow credentials
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// Helper function to log request details
const logRequest = (action, reason) => {
  console.log(`🔒 ${action} received`);
  console.log('📦 Reason:', reason);
  console.log('🕒 Time:', new Date().toISOString());
};

// 🔒 Logout endpoint
app.post('/signin/logout/', (req, res) => {
  const logoutReason = req.body?.reason || 'manual';
  logRequest('Logout', logoutReason);
  res.status(200).json({ message: 'Logout successful', reason: logoutReason });
});

// 🔒 Login endpoint
app.post('/signin/login/', (req, res) => {
  const loginReason = req.body?.reason || 'manual';
  logRequest('Login', loginReason);
  res.status(200).json({ message: 'Login successful', reason: loginReason });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
