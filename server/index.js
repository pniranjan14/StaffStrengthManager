const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const staffRoutes = require('./routes/staff');
const officeRoutes = require('./routes/offices');
const excelRoutes = require('./routes/excel');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/offices', officeRoutes);
app.use('/api/admin', excelRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', app: 'Kottayam Revenue Staff Strength Portal', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`Backend Server listening on http://localhost:${PORT}`);
});
