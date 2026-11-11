import api from './api'

// Fetch hotels based on the user's search criteria.
export async function searchHotels(searchCriteria) {
  const response = await api.get('/hotels', {
    params: searchCriteria,
  })

  return response.data
}

// Fetch one hotel's details and its available room options.
export async function getHotelDetails(hotelId, searchCriteria) {
  const response = await api.get(`/hotels/${hotelId}`, {
    params: searchCriteria,
  })

  return response.data
}