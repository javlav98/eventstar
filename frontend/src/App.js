import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [keyword, setKeyword] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [eventData, setEventData] = useState([]);

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

      if (Array.isArray(response.data)) {
        eventsArray = response.data;
      } else if (response.data._embedded && Array.isArray(response.data._embedded.events)) {
        eventsArray = response.data._embedded.events;
      } else {
        console.log("Unexpected response format:", response.data);
        // Handle the unexpected response format
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
          className="search-input"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search for events"
        />
        <button type="submit" className="search-button">Search</button>
      </form>

      <div>
        <h2>Search Results</h2>
        <ul>
          {eventData.map((event) => (
            <li key={event.id}>{event.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
