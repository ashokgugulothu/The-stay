  
# The Stay – Hotel Booking Application

The Stay is a full-stack MERN hotel booking application that allows users to explore hotels, check room availability, make bookings, and complete payments using Razorpay Test Mode.

This project was developed as a portfolio project to demonstrate practical full-stack development skills, REST API integration, authentication, database management, and payment gateway integration.

## Features

### User Authentication
- User registration and login.
- JWT-based authentication.
- Password hashing.
- Protected frontend routes and backend APIs.

### Hotel Search and Room Availability
- Browse hotels in Hyderabad.
- Explore hotel details, images, and available rooms.
- Search hotels using destination, check-in date, check-out date, and guest count.
- Check room availability for selected dates.
- Prevent overlapping active bookings for the same room.

### Booking Management
- Create hotel bookings.
- Maintain pending and confirmed booking statuses.
- Temporary room reservation during the payment process.
- View personal bookings.
- View individual booking details.
- Cancel eligible confirmed bookings.

### Payment Integration
- Razorpay Test Mode integration.
- Create a payment order when a booking is initiated.
- Open Razorpay Checkout.
- Verify payment signatures on the backend using HMAC SHA-256.
- Confirm bookings after successful payment verification.
- Store payment and booking information in MongoDB.

**Note:** This project uses Razorpay Test Mode. No real-money transactions are intended.

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript |
| Styling | CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcrypt |
| API Communication | Axios, REST APIs |
| Payment Gateway | Razorpay Test Mode |
| Validation | Backend request validation |
| Version Control | Git, GitHub |

## Project Architecture

```text
The-Stay/
│
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   ├── public/
│   ├── package.json
│   └── ...
│
├── server/                  # Express backend
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## Getting Started

Follow these instructions to run the project locally.

### Prerequisites

Install the following:

- Node.js and npm
- MongoDB Atlas account or a MongoDB instance
- Git
- Razorpay Test Mode API credentials

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/The-Stay.git
cd The-Stay
```

Replace `YOUR_USERNAME` with your GitHub username.

### 2. Configure the Backend

Open the backend directory:

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory.

Add the following environment variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
```

Replace the placeholder values with your own credentials. Never upload your actual `.env` file to GitHub.

Start the backend:

```bash
node server.js
```

The backend should run at:

```text
http://localhost:5000
```

### 3. Configure the Frontend

Open another terminal and navigate to the frontend directory:

```bash
cd client
npm install
```

Create a `.env` file inside the `client` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Start the frontend:

```bash
npm run dev
```

The frontend should run at:

```text
http://localhost:5173
```

## Payment Flow

The application uses Razorpay Test Mode to demonstrate the booking payment process.

1. User selects a hotel, room, and booking dates.
2. Backend checks room availability.
3. Backend creates a pending booking in MongoDB.
4. Backend creates a Razorpay test order.
5. Razorpay Checkout opens on the frontend.
6. User completes a test payment.
7. Frontend sends payment details to the backend.
8. Backend verifies the payment signature and payment details.
9. After successful verification, the booking status changes to `confirmed` and payment status changes to `paid`.
10. The user can view the confirmed booking under My Bookings.

## Booking Statuses

| Booking Status | Description |
|---|---|
| pending | Booking created and awaiting payment |
| confirmed | Payment successfully verified |
| cancelled | Booking cancelled |
| expired | Booking hold expired |

| Payment Status | Description |
|---|---|
| created | Payment order created |
| paid | Payment successfully verified |
| failed | Payment failed |
| expired | Payment hold expired |
| not_required | Payment not required |
| refunded | Refund status |

## Database

MongoDB stores the application's data.

Main collections:

- Users
- Hotels
- Rooms
- Bookings

The backend uses Mongoose models to manage database operations.

## Future Improvements

- Hotel reviews and ratings.
- Advanced filters and sorting.
- Admin dashboard for hotel and room management.
- Email booking confirmations.
- Improved mobile-responsive UI.
- Deployment and production configuration.

## Author

**Gugulothu Ashok**

MCA Graduate | Full-Stack Developer

Interested in software development, MERN stack applications, Python, and problem-solving.

