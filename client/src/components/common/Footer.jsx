
function Footer() {
  // Use the current year so the copyright stays up to date.
  const currentYear = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="footer-content">
        {/* Brand and short description. */}
        <div className="footer-brand">
          <h2>The Stay</h2>
          <p>
            Find your stay. Make every trip memorable.
          </p>
        </div>

        {/* Copyright information. */}
        <p className="footer-copyright">
          © {currentYear} The Stay. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer
