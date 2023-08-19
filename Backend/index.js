const express = require('express');
const axios = require('axios'); // Import axios
const app = express();
const port = 3000;

require('dotenv').config();

app.get('/practice-endpoint', async (req, res) => {
    try {
        // Make an API request to Ticketmaster
        const response = await axios.get('https://app.ticketmaster.com/discovery/v2/events.json', {
            params: {
                keyword: 'concert', // Example keyword
                apikey: process.env.TICKETMASTER_API_KEY // Replace with your actual API key
            },
        });

        // Extract the data from the response
        const eventData = response.data;

        // Send the event data as the response
        res.json(eventData);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('An error occurred while fetching data from Ticketmaster.');
    }
});

app.get('/search', async (req, res) => {
    try {
        const keyword = req.query.keyword || 'concert';
        const date = req.query.date || ''; // User-provided date
        const location = req.query.location || ''; // User-provided location

        // Construct the Ticketmaster API request based on user inputs
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
    console.log(`Example app listening at http://localhost:${port}`);
});
