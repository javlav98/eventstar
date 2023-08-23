import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
      
      setEventData(eventsArray);
      

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

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
      {/* You can display more event information here */}
    </div>
  ))}
</div>

    </div>
  );
}

export default App;