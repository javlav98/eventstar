import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarker, faCalendar } from '@fortawesome/free-solid-svg-icons';
import './App.css';
import OpenCageGeocode from 'opencage-api-client'; // Import the OpenCageGeocode package

function App() {
  const [keyword, setKeyword] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [eventData, setEventData] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    } else {
      console.error('Geolocation is not available in this browser.');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.get('http://localhost:3000/search', {
        params: {
          keyword,
          date,
          location,
        },
      });

      let eventsArray = [];

      if (response.data._embedded && Array.isArray(response.data._embedded.events)) {
        eventsArray = response.data._embedded.events;
      }

      const eventsWithDetails = eventsArray.map((event) => {
        const localDate = event.dates && event.dates.start ? event.dates.start.localDate : 'Date not available';
        const localTime = event.dates && event.dates.start ? event.dates.start.localTime : 'Time not available';

        let formattedDate = localDate;
        if (localTime && localTime !== 'Time not available') {
          formattedDate = `${localDate}T${localTime}`;
        }

        const priceRange = event.priceRanges && event.priceRanges.length > 0 ? event.priceRanges[0] : null;
        const price = priceRange
          ? `$${priceRange.min.toFixed(2)} - $${priceRange.max.toFixed(2)} ${priceRange.currency}`
          : 'Price not available';

        return {
          id: event.id,
          name: event.name,
          image: event.images && event.images.length > 0 ? event.images[0].url : null,
          link: event.url,
          price: price,
          time: localTime !== 'Time not available' ? new Date(formattedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }) : 'Time not available',
          date: localDate,
        };
      });

      setEventData(eventsWithDetails);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const truncateLink = (link, maxLength) => {
    return link.length > maxLength ? link.slice(0, maxLength) : link;
  };

  const getUserLocation = async () => {
    if (userLocation) {
      const { latitude, longitude } = userLocation;

      try {
        const response = await OpenCageGeocode.reverseGeocode({
          q: `${latitude}, ${longitude}`,
          language: 'en',
          key: 'YOUR_OPENCAGE_API_KEY', // Replace with your OpenCage API key
        });

        if (response.status.code === 200) {
          const city = response.results[0].components.city;
          setLocation(city);
        } else {
          console.error('Error reverse geocoding:', response.status.message);
        }
      } catch (error) {
        console.error('Error reverse geocoding:', error);
      }
    }
  };

  return (
    <div className="App">
      <h1>Event Search</h1>
      <form onSubmit={handleSubmit} className="search-bar">
        <div className="location-input">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter city or location"
            className="location-input-field"
          />
          <span className="location-icon" onClick={getUserLocation}>
            <FontAwesomeIcon icon={faMapMarker} />
          </span>
        </div>
        <div className="date-input">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="search-input">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search for events"
          />
        </div>
      </form>
      <div className="event-cards-container">
        {eventData.map((event) => (
          <div key={event.id} className="event-card">
            <h3>{event.name}</h3>
            {event.image && <img src={event.image} alt={event.name} className="event-image" />}
            {event.link && (
              <a href={event.link} target="_blank" rel="noopener noreferrer">
                {truncateLink(event.link, 30)}
                {event.link.length > 30 && '...'}
              </a>
            )}
            <p>Price: {event.price}</p>
            <p>Date: {event.date}</p>
            <p>Time: {event.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
