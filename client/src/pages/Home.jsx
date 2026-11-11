
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  const [destination, setDestination] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState('2')
  const [error, setError] = useState('')

  function handleSearch(event) {
    event.preventDefault()
    setError('')

    if (!destination.trim() || !checkIn || !checkOut || !guests) {
      setError('Please fill in all search fields.')
      return
    }

    if (checkOut <= checkIn) {
      setError('Check-out must be after check-in.')
      return
    }

    const searchParams = new URLSearchParams({
      destination: destination.trim(),
      checkIn,
      checkOut,
      guests,
    })

    navigate(`/hotels?${searchParams.toString()}`)
  }

  return (
    <main className="stay-home">
      <section className="stay-home-hero">
        <div className="stay-home-overlay" />

        <div className="stay-home-content">
          <span className="stay-home-eyebrow">
            YOUR JOURNEY BEGINS HERE
          </span>

          <h1>
            Discover a place
            <br />
            you'll love to stay
          </h1>

          <p className="stay-home-description">
            Find exceptional stays, explore beautiful destinations
            and create unforgettable memories.
          </p>

          <form
            className="stay-search-form"
            onSubmit={handleSearch}
          >
            <div className="stay-search-field">
              <label htmlFor="destination">Destination</label>
              <input
                id="destination"
                type="text"
                placeholder="Where are you going?"
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
              />
            </div>

            <div className="stay-search-field">
              <label htmlFor="checkIn">Check-in</label>
              <input
                id="checkIn"
                type="date"
                value={checkIn}
                min={new Date().toLocaleDateString('en-CA')}
                onChange={(event) => setCheckIn(event.target.value)}
              />
            </div>

            <div className="stay-search-field">
              <label htmlFor="checkOut">Check-out</label>
              <input
                id="checkOut"
                type="date"
                value={checkOut}
                min={checkIn || new Date().toLocaleDateString('en-CA')}
                onChange={(event) => setCheckOut(event.target.value)}
              />
            </div>

            <div className="stay-search-field">
              <label htmlFor="guests">Guests</label>
              <select
                id="guests"
                value={guests}
                onChange={(event) => setGuests(event.target.value)}
              >
                {[1, 2, 3, 4, 5, 6].map((number) => (
                  <option key={number} value={number}>
                    {number} {number === 1 ? 'Guest' : 'Guests'}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="stay-search-button">
              Search stays
            </button>
          </form>

          {error && (
            <p className="stay-search-error" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="stay-hero-bottom">
          <span>COMFORT · QUALITY · EXPERIENCE</span>
          <span>Make yourself at home.</span>
        </div>
      </section>
    </main>
  )
}

export default Home
