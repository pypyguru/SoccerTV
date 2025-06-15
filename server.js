const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for GitHub Pages domain
app.use(cors({
    origin: ['https://pypyguru.github.io/SoccerTV/', 'http://localhost:5500'],
    methods: ['GET'],
    credentials: true
}));

// Proxy endpoint
app.get('/api/schedule', async (req, res) => {
    try {
        const response = await axios.get('https://daddylive.dad/schedule/schedule-generated.php', {
            headers: {
                'accept': '*/*',
                'accept-language': 'en-US,en;q=0.5',
                'sec-ch-ua': '"Brave";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'sec-gpc': '1',
                'referer': 'https://daddylive.dad/index.php'
            }
        });

        // Check if response is HTML with the error message
        if (response.data.includes('Schedule API Available for allowed Domain only')) {
            throw new Error('API access restricted');
        }

        res.json(response.data);
    } catch (error) {
        console.error('Proxy error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch schedule data',
            message: error.message
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 