console.log('SERVER STARTING... Initializing modules...');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

process.on('uncaughtException', (err) => {
    console.error('FATAL PROCESS ERROR (uncaughtException):', err);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('FATAL PROCESS ERROR (unhandledRejection):', reason);
    process.exit(1);
});

const app = express();
const BACKEND_PORT = process.env.BACKEND_PORT || 5001;
const PORT = parseInt(BACKEND_PORT);

console.log(`[BOOT] Initializing server on port ${PORT}...`);

// Start Server Early to claim the port
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BOOT] TCP Server listening on port ${PORT} (PID: ${process.pid})`);
});

console.log('[BOOT] Loading Middlewares...');
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

console.log('[BOOT] Loading Routes...');
const { admin } = require('./config/firebase');

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString(), port: PORT, firebase: !!admin });
});

app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/accounts', require('./routes/accountRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/bio', require('./routes/bioRoutes'));

console.log('[BOOT] Initializing Scheduler...');
const cron = require('node-cron');
const { publishDuePosts } = require('./services/scheduler');
cron.schedule('* * * * *', () => {
    console.log('Running scheduled post check...');
    publishDuePosts();
});

console.log('[BOOT] Backend startup sequence completed.');

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('GLOBAL ERROR CAUGHT:', err);
    res.status(500).json({
        message: 'Internal Server Error detected by Global Handler',
        error: err.message
    });
});
