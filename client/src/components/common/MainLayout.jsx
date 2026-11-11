import { Outlet } from 'react-router-dom'

import Navbar from './Navbar'
import Footer from './Footer'

function MainLayout() {
  return (
    <>
      {/* Shared navigation at the top of the website. */}
      <Navbar />

      {/* The matching route's page content renders here. */}
      <main>
        <Outlet />
      </main>

      {/* Shared footer below the page content. */}
      <Footer />
    </>
  )
}

export default MainLayout