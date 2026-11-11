import { Routes, Route } from 'react-router-dom'

import MainLayout from '../components/common/MainLayout'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import BookingDetails from '../pages/BookingDetails'
import BookingConfirmation from '../pages/BookingConfirmation'

import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import HotelList from '../pages/HotelList'
import HotelDetails from '../pages/HotelDetails'
import MyBookings from '../pages/MyBookings'

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>

        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="hotels" element={<HotelList />} />
        <Route path="hotels/:hotelId" element={<HotelDetails />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="my-bookings" element={<MyBookings />} />
          <Route path="my-bookings/:bookingId" element={<BookingDetails />} />
           <Route path="booking-confirmation"element={<BookingConfirmation />} />
        </Route>

      </Route>
    </Routes>
  )
}

export default AppRoutes