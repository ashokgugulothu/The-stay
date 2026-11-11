
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { getHotelDetails } from '../services/hotelService'

// Fallback image used when a hotel has no image.
const FALLBACK_HOTEL_IMAGE =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=85'

function HotelDetails() {
  // Get the hotel ID from the URL.
  const { hotelId } = useParams()

  // Preserve search information from the previous page.
  const [searchParams] = useSearchParams()

  const navigate = useNavigate()

  const [hotel, setHotel] = useState(null)
  const [rooms, setRooms] = useState([])
  const [selectedRoomId, setSelectedRoomId] = useState('')
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const checkIn = searchParams.get('checkIn') || ''
  const checkOut = searchParams.get('checkOut') || ''
  const guests = searchParams.get('guests') || '1'
  const selectedRoomFromUrl = searchParams.get('roomId') || ''

  // Fetch hotel information and room options.
  useEffect(() => {
    let isActive = true

    async function fetchHotelDetails() {
      try {
        setLoading(true)
        setError('')

        const data = await getHotelDetails(hotelId, {
          checkIn,
          checkOut,
          guests,
        })

        if (isActive) {
          const fetchedRooms = data.rooms || []

          setHotel(data.hotel)
          setRooms(fetchedRooms)

          // Restore a previously selected room only if it is still returned.
          const roomStillAvailable = fetchedRooms.some(
            (room) => room._id === selectedRoomFromUrl,
          )

          setSelectedRoomId(
            roomStillAvailable ? selectedRoomFromUrl : '',
          )

          // Start the gallery from its first image.
          setActiveImageIndex(0)
        }
      } catch (requestError) {
        if (isActive) {
          setError(
            'Unable to load hotel details. Please try again later.',
          )
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    fetchHotelDetails()

    return () => {
      isActive = false
    }
  }, [hotelId, checkIn, checkOut, guests, selectedRoomFromUrl])

  // Use the hotel's image array, with a fallback when it is empty.
  const hotelImages =
    hotel?.images?.length > 0
      ? hotel.images
      : hotel?.thumbnailUrl
        ? [hotel.thumbnailUrl]
        : [FALLBACK_HOTEL_IMAGE]

  const activeHotelImage =
    hotelImages[activeImageIndex] || hotelImages[0]

  // Continue to the existing booking confirmation flow.
  function handleReserve() {
    if (!selectedRoomId) {
      setError('Please select a room before continuing.')
      return
    }

    const bookingParams = new URLSearchParams({
      hotelId,
      roomId: selectedRoomId,
      checkIn,
      checkOut,
      guests,
    })

    navigate(`/booking-confirmation?${bookingParams.toString()}`)
  }

  if (loading) {
    return (
      <main className="page-message">
        Loading hotel details...
      </main>
    )
  }

  if (error && !hotel) {
    return <main className="page-message">{error}</main>
  }

  if (!hotel) {
    return (
      <main className="page-message">
        Hotel not found.
      </main>
    )
  }

  return (
    <main className="stay-details-page">

      {/* Hotel heading and basic information */}
      <section className="stay-details-heading">
        <div>
          <p className="stay-details-eyebrow">
            THE STAY COLLECTION
          </p>

          <p className="stay-details-location">
            {hotel.city}
          </p>

          <h1>{hotel.name}</h1>

          <div className="stay-details-meta">
            {hotel.starRating > 0 && (
              <span className="stay-details-rating">
                {'★'.repeat(Number(hotel.starRating))}
              </span>
            )}

            <span className="stay-details-address">
              {hotel.address}
            </span>
          </div>
        </div>
      </section>

      {/* Main hotel image and selectable thumbnails */}
      <section className="stay-gallery">
        <div className="stay-gallery-main">
          <img
            src={activeHotelImage}
            alt={`${hotel.name} - hotel view`}
            onError={(event) => {
              event.currentTarget.src = FALLBACK_HOTEL_IMAGE
            }}
          />

          <span className="stay-gallery-label">
            EXPLORE THE PROPERTY
          </span>
        </div>

        {hotelImages.length > 1 && (
          <div className="stay-gallery-thumbnails">
            {hotelImages.map((image, index) => (
              <button
                type="button"
                key={`${image}-${index}`}
                className={`stay-gallery-thumbnail ${
                  activeImageIndex === index ? 'active' : ''
                }`}
                onClick={() => setActiveImageIndex(index)}
                aria-label={`View hotel image ${index + 1}`}
                aria-pressed={activeImageIndex === index}
              >
                <img
                  src={image}
                  alt={`${hotel.name} view ${index + 1}`}
                  onError={(event) => {
                    event.currentTarget.src = FALLBACK_HOTEL_IMAGE
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Hotel description */}
      <section className="stay-about-hotel">
        <div>
          <p className="stay-section-eyebrow">
            WELCOME TO THE STAY
          </p>

          <h2>Experience a comfortable stay</h2>
        </div>

        <p className="stay-about-description">
          {hotel.description ||
            'Discover comfort, convenience and thoughtful hospitality at this property.'}
        </p>

        <p className="stay-about-address">
          <strong>Location:</strong> {hotel.address}, {hotel.city}
        </p>
      </section>

      {/* Existing room selection section */}
      <section className="room-options">
        <h2>
          {checkIn && checkOut ? 'Choose your room' : 'Explore our rooms'}
        </h2>

        {rooms.length === 0 ? (
          <p>
            No rooms are available for the selected search criteria.
          </p>
        ) : (
          rooms.map((room) => (
            <article className="room-card" key={room._id}>
              <div>
                <h3>{room.roomType}</h3>
                <p>Capacity: {room.capacity} guest(s)</p>

                <p className="room-price">
                  ₹{Number(room.pricePerNight).toLocaleString('en-IN')} / night
                </p>
              </div>

              <label className="room-select">
                <input
                  type="radio"
                  name="selectedRoom"
                  value={room._id}
                  checked={selectedRoomId === room._id}
                  onChange={() => {
                    setSelectedRoomId(room._id)
                    setError('')
                  }}
                />
                Select room
              </label>
            </article>
          ))
        )}

        {error && <p className="form-error">{error}</p>}

        {rooms.length > 0 && (
          <button
            className="reserve-button"
            type="button"
            onClick={handleReserve}
          >
            Continue to booking
          </button>
        )}
      </section>
    </main>
  )
}

export default HotelDetails
