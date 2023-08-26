import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EventImages from './EventImg'; // Update with the correct path
import './App.css';

function App() {
  const [keyword, setKeyword] = useState('');
  const [date, setDate] = useState('');
  const [locationType, setLocationType] = useState('city');
  const [locationValue, setLocationValue] = useState('');
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
      let locationParams = {};

      if (locationType === 'userLocation' && userLocation) {
        locationParams = {
          latlong: `${userLocation.latitude},${userLocation.longitude}`,
        };
      } else if (locationType === 'zipcode') {
        locationParams = {
          postalCode: locationValue,
        };
      } else if (locationType === 'city') {
        locationParams = {
          city: locationValue,
        };
      }

      const response = await axios.get('http://localhost:3000/search', {
        params: {
          keyword,
          date,
          ...locationParams,
        },
      });
      
      let eventsArray = [];
      
      if (response.data._embedded && Array.isArray(response.data._embedded.events)) {
        eventsArray = response.data._embedded.events;
      }

      const eventsWithDetails = eventsArray.map(event => {
        const localDate = event.dates && event.dates.start ? event.dates.start.localDate : 'Date not available';
        const localTime = event.dates && event.dates.start ? event.dates.start.localTime : 'Time not available';
      
        let formattedDate = localDate;
        if (localTime && localTime !== 'Time not available') {
          // Concatenate date and time strings in a format that can be parsed by Date
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

function truncateLink(link, maxLength) {
  return link.length > maxLength ? link.slice(0, maxLength) : link;
}

  return (
    <div className="App">
      <h1>Event Search</h1>
      <form onSubmit={handleSubmit} className="search-bar">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search for events"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <div className="location-input">
          <select
            value={locationType}
            onChange={(e) => setLocationType(e.target.value)}
          >
            <option value="city">City</option>
            <option value="zipcode">Zipcode</option>
            <option value="userLocation">User Location</option>
          </select>
          {locationType !== 'userLocation' && (
            <input
              type="text"
              value={locationValue}
              onChange={(e) => setLocationValue(e.target.value)}
              placeholder={locationType === 'city' ? 'Enter city' : 'Enter zipcode'}
            />
          )}
        </div>
        <button type="submit">Search</button>
      </form>
      <div className="event-cards-container">
  {eventData.map((event) => (
    <div key={event.id} className="event-card">
      <h3>{event.name}</h3>
      {event.image && <img src={event.image} alt={event.name} className="event-image" />}
      {event.link && (
        <a href={event.link} target="_blank" rel="noopener noreferrer">
          {truncateLink(event.link, 30)} {/* Display truncated link */}
          {event.link.length > 30 && '...'} {/* Display ellipsis if link is longer */}
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