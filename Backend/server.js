const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;
const axios = require('axios');

const cors = require('cors');

//Routes
const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');

// Middleware
const checkForAuthentication = require('./middleware/checkforAuthentication');

app.use(express.json());
app.get('/', (req, res) => {
    res.send('ChaterG Server is up and running');
});

app.use(cors({
    origin: true,
    credentials: true
}));

app.use('/user', userRoutes);
app.use('/api/chat', chatRoutes);
// Root endpoint for health
app.get('/chat', async (req, res) => {
    const pool = require('./db');
    try {
        const result = await pool.query('SELECT id, title FROM chats ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Failed to fetch chat list:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});