console.log('SERVER STARTING... Initializing modules...');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

process.on('uncaughtException', (err) => {
    console.error('FATAL PROCESS ERROR (uncaughtException):', err);
    if (!err.message?.includes('Execution context was destroyed')) {
        process.exit(1);
    }
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('FATAL PROCESS ERROR (unhandledRejection):', reason);
    // Puppeteer sometimes throws "Execution context was destroyed" which is non-fatal for the server
    if (!reason?.message?.includes('Execution context was destroyed')) {
        process.exit(1);
    }
});

const app = express();
app.set('trust proxy', true);
const BACKEND_PORT = process.env.BACKEND_PORT || 5001;
const PORT = parseInt(BACKEND_PORT);

console.log(`[BOOT] Initializing server on port ${PORT}...`);

// Start Server Early to claim the port
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BOOT] TCP Server listening on port ${PORT} (PID: ${process.pid})`);
});

console.log('[BOOT] Loading Middlewares...');
app.use(cors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'https://www.isocialmidia.com.br', 'https://isocialmedia.com.br'],
    credentials: true
}));

// Basic CSP to avoid "default-src none" issues in some dev environments
app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'self' http: https: data: blob: 'unsafe-inline' 'unsafe-eval';");
    next();
});

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize Passport
const passport = require('./config/passport');
app.use(passport.initialize());

console.log('[BOOT] Loading Routes...');
const { admin } = require('./config/firebase');

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString(), port: PORT, firebase: !!admin });
});

app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/accounts', require('./routes/accountRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/bio', require('./routes/bioRoutes'));
app.use('/api/whatsapp', require('./routes/whatsappRoutes'));
app.use('/api/site-analytics', require('./routes/siteAnalyticsRoutes'));


console.log('[BOOT] Backend startup sequence completed.');

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('GLOBAL ERROR CAUGHT:', err);
    res.status(500).json({
        message: 'Internal Server Error detected by Global Handler',
        error: err.message
    });
});
