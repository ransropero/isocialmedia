require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const sequelize = require('./config/db');
const postRoutes = require('./routes/postRoutes');
const { publishDuePosts } = require('./services/scheduler');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/posts', postRoutes);
app.use('/api/accounts', require('./routes/accountRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

// Sync Database
sequelize.sync().then(() => {
    console.log('Database connected and synced');
}).catch((err) => {
    console.error('Database sync error:', err);
});

// Scheduler: Run every minute
cron.schedule('* * * * *', () => {
    console.log('Running scheduled post check...');
    publishDuePosts();
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
