import React, { useState, useEffect } from 'react';
import axios from 'axios';

function EventImages({ eventId }) {
  const [images, setImages] = useState([]);

  useEffect(() => {
    async function fetchEventImages() {
      try {
        const response = await axios.get(`http://localhost:3000/discovery/v2/events/${eventId}/images`, {
          params: {
            apikey: process.env.REACT_APP_TICKETMASTER_API_KEY, // Use your actual environment variable here
          },
        });
        setImages(response.data.images);
      } catch (error) {
        console.error('Error fetching event images:', error);
      }
    }

    fetchEventImages();
  }, [eventId]);

  return (
    <div>
      <div>
        {images.map((image) => (
          <img key={image.id} src={image.url} alt={`Event`} />
        ))}
      </div>
    </div>
  );
}

export default EventImages;
