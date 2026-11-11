
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { searchHotels } from '../services/hotelService'

// Used when a hotel does not have an image.
const FALLBACK_HOTEL_IMAGE =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85'

function HotelList() {
  // Read search criteria from the URL.
  const [searchParams] = useSearchParams()

  const destination = searchParams.get('destination') || ''
  const checkIn = searchParams.get('checkIn') || ''
  const checkOut = searchParams.get('checkOut') || ''
  const guests = searchParams.get('guests') || '2'

  // Determine whether the user selected stay dates.
  const hasDates = Boolean(checkIn && checkOut)

  // Store hotels returned by the backend.
  const [hotels, setHotels] = useState([])

  // Track API request status.
  const [loading, setLoading] = useState(true)

  // Store API or network errors.
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true

    async function loadHotels() {
      setLoading(true)
      setError('')

      try {
        const data = await searchHotels({
          destination,
          checkIn,
          checkOut,
          guests,
        })

        if (isActive) {
          setHotels(data.hotels || [])
        }
      } catch (requestError) {
        console.error('Hotel loading error:', requestError)

        if (isActive) {
          setError('Unable to load hotels. Please try again later.')
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    // Browse mode does not require dates.
    // Search mode can also use the selected dates.
    loadHotels()

    // Avoid updating state after component unmounts.
    return () => {
      isActive = false
    }
  }, [destination, checkIn, checkOut, guests])

  // Format dates for a readable search summary.
  function formatDate(dateString) {
    if (!dateString) return ''

    return new Date(`${dateString}T00:00:00`).toLocaleDateString(
      'en-IN',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }
    )
  }

  return (
    <main className="stay-list-page">

      {/* Page heading */}
      <section className="stay-list-heading">
        <div className="stay-list-heading-content">
          <p className="stay-list-eyebrow">EXPLORE YOUR NEXT STAY</p>

          <h1>
            {destination ? (
              <>Stays in <span>{destination}</span></>
            ) : (
              <>Discover <span>your next stay</span></>
            )}
          </h1>

          <p className="stay-list-description">
            Discover comfortable spaces and find the right stay for your trip.
          </p>

          {/* Search summary */}
          <div className="stay-search-summary">
            {hasDates && (
              <>
                <span>
                  <strong>Check-in</strong>
                  {formatDate(checkIn)}
                </span>

                <span>
                  <strong>Check-out</strong>
                  {formatDate(checkOut)}
                </span>
              </>
            )}

            <span>
              <strong>Guests</strong>
              {guests} {guests === '1' ? 'guest' : 'guests'}
            </span>
          </div>
        </div>
      </section>

      {/* Hotel results */}
      <section className="stay-results-section">

        <div className="stay-results-heading">
          <div>
            <p className="stay-results-eyebrow">
              HANDPICKED FOR YOUR JOURNEY
            </p>

            <h2>
              {hasDates ? 'Available hotels' : 'Explore our hotels'}
            </h2>
          </div>

          {!loading && !error && (
            <p className="stay-results-count">
              {hotels.length} {hotels.length === 1 ? 'property' : 'properties'} found
            </p>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="stay-message">
            <div className="stay-loader"></div>
            <h3>Finding your perfect stay...</h3>
            <p>Please wait while we search for hotels.</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="stay-message stay-error">
            <h3>Something went wrong</h3>
            <p>{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && hotels.length === 0 && (
          <div className="stay-message">
            <h3>No hotels found</h3>

            <p>
              {hasDates
                ? "We couldn't find available hotels for these dates. Try different dates or another destination."
                : "We couldn't find hotels matching your search. Try another destination."}
            </p>

            <Link to="/" className="stay-back-home">
              Back to home
            </Link>
          </div>
        )}

        {/* Hotel cards */}
        {!loading && !error && hotels.length > 0 && (
          <div className="stay-hotel-grid">
            {hotels.map((hotel) => (
              <article className="stay-hotel-card" key={hotel._id}>

                {/* Hotel image */}
                <div className="stay-hotel-image-wrapper">
                  <img
                    className="stay-hotel-image"
                   src={hotel.images?.[0] ||hotel.thumbnailUrl ||FALLBACK_HOTEL_IMAGE}
                    alt={`${hotel.name} in ${hotel.city}`}
                    onError={(event) => {
                      event.currentTarget.onerror = null
                      event.currentTarget.src = FALLBACK_HOTEL_IMAGE
                    }}
                  />

                  <span className="stay-image-label">
                    {hotel.starRating
                      ? `${hotel.starRating}-STAR HOTEL`
                      : 'YOUR NEXT STAY'}
                  </span>
                </div>

                {/* Hotel information */}
                <div className="stay-hotel-content">

                  <div className="stay-hotel-top">
                    <div>
                      <p className="stay-hotel-location">
                        <span aria-hidden="true">⌖</span>
                        {hotel.city}
                      </p>

                      <h3>{hotel.name}</h3>
                    </div>

                    {hotel.starRating && (
                      <span className="stay-star-category">
                        ★ {hotel.starRating}
                      </span>
                    )}
                  </div>

                  <div className="stay-hotel-divider"></div>

                  {/* Price and details */}
                  <div className="stay-hotel-bottom">
                    <div className="stay-price">
                      <p>
                        {hasDates ? 'Starting from' : 'Starting from'}
                      </p>

                      <h4>
                        ₹{Number(hotel.cheapestPrice).toLocaleString('en-IN')}
                        <span> / night</span>
                      </h4>
                    </div>

                    <Link
                      className="stay-view-details"
                      to={`/hotels/${hotel._id}?${searchParams.toString()}`}
                    >
                      View details
                      <span aria-hidden="true"> →</span>
                    </Link>
                  </div>

                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default HotelList
