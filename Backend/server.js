const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;
const axios = require('axios');

const cors = require('cors');

//Routes
const userRoutes = require('./routes/user');

app.use(express.json());
app.get('/', (req, res) => {
    res.send('ChaterG Server is up and running');
});

app.use(cors());

app.use('/user', userRoutes);
app.post('/chat', async (req, res) => {
    const { prompt } = req.body;
    try {
        const response = await axios.post('http://localhost:11434/api/generate', {
            model: 'gemma',
            prompt: prompt,
            stream: false
        });

        res.json({ response: response.data });
    }
    catch (error) {
        console.error('Error in /chat route:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});