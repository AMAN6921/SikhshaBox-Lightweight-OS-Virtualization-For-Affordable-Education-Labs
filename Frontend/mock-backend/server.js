const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;
const SECRET_KEY = 'contain-r-secret-key-2024';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Mock users database
const users = [
  { id: 1, username: '230211160', password: 'password123', name: 'Aman Devrani', role: 'student' },
  { id: 2, username: '230122329', password: 'password123', name: 'Muskaan Pant', role: 'student' },
  { id: 3, username: 'Atharv Bali', password: 'admin123', name: 'Atharv Bali', role: 'instructor' },
  { id: 4, username: 'Amey Jhaldiyal', password: 'admin123', name: 'Amey Jhaldiyal', role: 'instructor' }
];

// Mock containers data
let containers = [
  { id: 1, username: '230211160', status: 'stopped', uptime: '0h 0m' },
  { id: 2, username: '230122329', status: 'running', uptime: '2h 15m' }
];

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    SECRET_KEY,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    }
  });
});

app.get('/api/auth/verify', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role
  });
});

// Container endpoints (Student)
app.get('/api/containers/status', authenticateToken, (req, res) => {
  const container = containers.find(c => c.username === req.user.username);
  
  res.json({
    status: container ? container.status : 'stopped',
    stats: {
      cpu: Math.floor(Math.random() * 60) + 10,
      memory: Math.floor(Math.random() * 50) + 20,
      disk: Math.floor(Math.random() * 40) + 15
    }
  });
});

app.post('/api/containers/start', authenticateToken, (req, res) => {
  const container = containers.find(c => c.username === req.user.username);
  
  if (container) {
    container.status = 'running';
    container.uptime = '0h 1m';
  } else {
    containers.push({
      id: containers.length + 1,
      username: req.user.username,
      status: 'running',
      uptime: '0h 1m'
    });
  }

  res.json({ message: 'Container started successfully', status: 'running' });
});

app.post('/api/containers/stop', authenticateToken, (req, res) => {
  const container = containers.find(c => c.username === req.user.username);
  
  if (container) {
    container.status = 'stopped';
    container.uptime = '0h 0m';
  }

  res.json({ message: 'Container stopped successfully', status: 'stopped' });
});

app.post('/api/containers/reset', authenticateToken, (req, res) => {
  const container = containers.find(c => c.username === req.user.username);
  
  if (container) {
    container.status = 'stopped';
    container.uptime = '0h 0m';
  }

  res.json({ message: 'Container reset successfully', status: 'stopped' });
});

// Admin endpoints (Instructor only)
const requireInstructor = (req, res, next) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({ message: 'Instructor access required' });
  }
  next();
};

app.get('/api/admin/containers', authenticateToken, requireInstructor, (req, res) => {
  res.json(containers);
});

app.get('/api/admin/users', authenticateToken, requireInstructor, (req, res) => {
  const userList = users.map(u => ({
    id: u.id,
    username: u.username,
    name: u.name,
    role: u.role
  }));
  res.json(userList);
});

app.post('/api/admin/users', authenticateToken, requireInstructor, (req, res) => {
  const { username, password, name } = req.body;

  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  const newUser = {
    id: users.length + 1,
    username,
    password,
    name,
    role: 'student'
  };

  users.push(newUser);

  res.json({
    message: 'User created successfully',
    user: {
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      role: newUser.role
    }
  });
});

app.delete('/api/admin/users/:id', authenticateToken, requireInstructor, (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  users.splice(userIndex, 1);
  res.json({ message: 'User deleted successfully' });
});

app.get('/api/admin/stats', authenticateToken, requireInstructor, (req, res) => {
  const activeContainers = containers.filter(c => c.status === 'running').length;
  
  res.json({
    totalUsers: users.filter(u => u.role === 'student').length,
    activeContainers: activeContainers,
    systemLoad: `${Math.floor(Math.random() * 40) + 20}%`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Mock Backend Server Running!`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`\n👥 Demo Credentials:`);
  console.log(`\n   Student Accounts:`);
  console.log(`   Username: 230211160 (Aman Devrani)`);
  console.log(`   Username: 230122329 (Muskaan Pant)`);
  console.log(`   Password: password123`);
  console.log(`\n   Instructor Accounts:`);
  console.log(`   Username: Atharv Bali`);
  console.log(`   Username: Amey Jhaldiyal`);
  console.log(`   Password: admin123`);
  console.log(`\n✨ Ready to accept requests!\n`);
});