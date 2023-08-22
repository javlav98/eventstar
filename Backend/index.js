const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000; // Use the port from the environment variable if available

app.use(cors());


app.get('/search', async (req, res) => {
    try {
        const keyword = req.query.keyword || 'concert';
        const date = req.query.date || '';
        const location = req.query.location || '';

        const response = await axios.get('https://app.ticketmaster.com/discovery/v2/events.json', {
            params: {
                keyword,
                apikey: process.env.TICKETMASTER_API_KEY,
                postalCode: location,
            },
        });

        const eventData = response.data;
        res.json(eventData);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('An error occurred while fetching data from Ticketmaster.');
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
