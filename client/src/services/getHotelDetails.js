import api from './api'

// Search hotels using destination and stay dates.
export async function searchHotels(searchCriteria) {
  const response = await api.get('/hotels', {
    params: searchCriteria,
  })

  return response.data
}

// Fetch one hotel's details and its room options.
export async function getHotelDetails(hotelId, searchCriteria) {
  const response = await api.get(`/hotels/${hotelId}`, {
    params: searchCriteria,
  })

  return response.data
}
//export default getHotelDetails