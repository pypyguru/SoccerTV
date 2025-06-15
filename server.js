const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for GitHub Pages domain
app.use(cors({
    origin: ['https://pypyguru.github.io', 'http://localhost:5500'],
    methods: ['GET'],
    credentials: true
}));

// Root path handler
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Soccer Schedule API Proxy is running',
        endpoints: {
            schedule: '/api/schedule',
            health: '/health'
        }
    });
});

// Proxy endpoint
app.get('/api/schedule', async (req, res) => {
    console.log('Received schedule request');
    try {
        console.log('Making request to daddylive.dad...');
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

        console.log('Response received:', response.status);
        console.log('Response type:', typeof response.data);

        // Check if response is HTML with the error message
        if (typeof response.data === 'string' && response.data.includes('Schedule API Available for allowed Domain only')) {
            console.log('API access restricted error detected');
            throw new Error('API access restricted');
        }

        // If response is already JSON, send it directly
        if (typeof response.data === 'object') {
            console.log('Sending JSON response to client');
            return res.json(response.data);
        }

        // If response is string, try to parse it as JSON
        try {
            const jsonData = JSON.parse(response.data);
            console.log('Successfully parsed string response as JSON');
            return res.json(jsonData);
        } catch (parseError) {
            console.log('Failed to parse response as JSON:', parseError.message);
            throw new Error('Invalid response format from API');
        }

    } catch (error) {
        console.error('Proxy error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch schedule data',
            message: error.message,
            details: error.response ? {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data
            } : null
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Health check available at: http://localhost:${port}/health`);
    console.log(`Schedule API available at: http://localhost:${port}/api/schedule`);
}); 