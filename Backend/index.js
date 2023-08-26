const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get('/search', async (req, res) => {
  try {
    const keyword = req.query.keyword || 'concert';
    const startDate = req.query.date || '';
    const endDate = req.query.date || '';
    const locationParams = req.query;

    const response = await axios.get('https://app.ticketmaster.com/discovery/v2/events.json', {
      params: {
        keyword,
        apikey: process.env.TICKETMASTER_API_KEY,
        startDateTime: startDate ? `${startDate}T00:00:00Z` : '',
        endDateTime: endDate ? `${endDate}T23:59:59Z` : '',
        ...locationParams,
      },
    });

    const eventData = response.data;
    res.json(eventData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('An error occurred while fetching data from Ticketmaster.');
  }
});

app.get('/discovery/v2/events/:id/images', async (req, res) => {
  try {
    const eventId = req.params.id;
    
    const response = await axios.get(`https://app.ticketmaster.com/discovery/v2/events/${eventId}/images.json`, {
      params: {
        apikey: process.env.TICKETMASTER_API_KEY,
      },
    });

    const imagesData = response.data;
    res.json(imagesData);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).send('An error occurred while fetching images from Ticketmaster.');
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
