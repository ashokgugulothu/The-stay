
require('dotenv').config()

const mongoose = require('mongoose')
const connectDB = require('../config/db')

const Hotel = require('../models/Hotel')
const Room = require('../models/Room')

// Sample development inventory for Hyderabad.
// These are demonstration listings, not real hotel listings.

// Create five rooms for each new hotel.
function createRooms(prefix, basePrice, image) {
  const templates = [
    {
      label: 'Standard Room 101',
      roomType: 'Standard',
      capacity: 2,
      multiplier: 1,
    },
    {
      label: 'Deluxe Room 201',
      roomType: 'Deluxe',
      capacity: 3,
      multiplier: 1.45,
    },
    {
      label: 'Suite Room 301',
      roomType: 'Suite',
      capacity: 4,
      multiplier: 2.1,
    },
    {
      label: 'Family Room 401',
      roomType: 'Family',
      capacity: 4,
      multiplier: 1.85,
    },
    {
      label: 'Twin Room 501',
      roomType: 'Standard',
      capacity: 2,
      multiplier: 1.15,
    },
  ]

  return templates.map((room) => ({
    name: `${prefix} ${room.label}`,
    roomType: room.roomType,
    capacity: room.capacity,
    pricePerNight:
      Math.round((basePrice * room.multiplier) / 100) * 100,
    description: `${room.roomType} accommodation with comfortable facilities.`,
    amenities: ['Wi-Fi', 'Air Conditioning', 'TV'],
    images: [image],
  }))
}

// Each hotel has exactly five room definitions.
const sampleHotels = [
  // Existing hotel 1: preserve its name and existing room names.
  {
    name: 'StayEase Grand Hyderabad',
    city: 'Hyderabad',
    address: 'HITEC City, Hyderabad, Telangana',
    description: 'A comfortable sample hotel near Hyderabad technology district.',
    starRating: 4,
    amenities: ['Wi-Fi', 'Restaurant', 'Parking', 'Air Conditioning'],
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85',
    rooms: [
      {
        name: 'Standard Room 101',
        roomType: 'Standard',
        capacity: 2,
        pricePerNight: 1800,
        amenities: ['Wi-Fi', 'Air Conditioning'],
      },
      {
        name: 'Deluxe Room 201',
        roomType: 'Deluxe',
        capacity: 3,
        pricePerNight: 2800,
        amenities: ['Wi-Fi', 'TV', 'Mini Fridge'],
      },
      {
        name: 'Family Suite 301',
        roomType: 'Family',
        capacity: 4,
        pricePerNight: 4200,
        amenities: ['Wi-Fi', 'TV', 'Living Area'],
      },
      {
        name: 'Executive Suite 401',
        roomType: 'Suite',
        capacity: 4,
        pricePerNight: 5200,
        amenities: ['Wi-Fi', 'TV', 'Living Area'],
      },
      {
        name: 'Twin Room 501',
        roomType: 'Standard',
        capacity: 2,
        pricePerNight: 2200,
        amenities: ['Wi-Fi', 'TV', 'Air Conditioning'],
      },
    ],
  },

  // Existing hotel 2: same name and city, new Kukatpally address.
  {
    name: 'StayEase City Comfort',
    city: 'Hyderabad',
    address: 'Kukatpally, Hyderabad, Telangana',
    description: 'A sample city hotel suitable for families and business travellers.',
    starRating: 3,
    amenities: ['Wi-Fi', 'Parking', 'Room Service'],
    image:
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=85',
    rooms: [
      {
        name: 'Standard Room 102',
        roomType: 'Standard',
        capacity: 2,
        pricePerNight: 1400,
        amenities: ['Wi-Fi', 'Air Conditioning'],
      },
      {
        name: 'Deluxe Room 202',
        roomType: 'Deluxe',
        capacity: 3,
        pricePerNight: 2200,
        amenities: ['Wi-Fi', 'TV'],
      },
      {
        name: 'Family Room 302',
        roomType: 'Family',
        capacity: 4,
        pricePerNight: 3600,
        amenities: ['Wi-Fi', 'TV', 'Living Area'],
      },
      {
        name: 'Suite Room 402',
        roomType: 'Suite',
        capacity: 4,
        pricePerNight: 4500,
        amenities: ['Wi-Fi', 'TV', 'Mini Fridge'],
      },
      {
        name: 'Twin Room 502',
        roomType: 'Standard',
        capacity: 2,
        pricePerNight: 1700,
        amenities: ['Wi-Fi', 'TV'],
      },
    ],
  },

  // Madhapur: two new hotels.
  {
    name: 'The Stay Madhapur Suites',
    city: 'Hyderabad',
    address: 'Madhapur, Hyderabad, Telangana',
    description: 'A sample modern stay in Madhapur.',
    starRating: 4,
    amenities: ['Wi-Fi', 'Restaurant', 'Parking', 'Gym'],
    image:
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=85',
    rooms: createRooms('Madhapur', 2000,
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=85'),
  },
  {
    name: 'The Stay Madhapur Residency',
    city: 'Hyderabad',
    address: 'Madhapur, Hyderabad, Telangana',
    description: 'A sample comfortable city residence in Madhapur.',
    starRating: 3,
    amenities: ['Wi-Fi', 'Parking', 'Room Service'],
    image:
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=85',
    rooms: createRooms('Madhapur Residency', 1700,
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=85'),
  },

  // Gachibowli: two new hotels.
  {
    name: 'The Stay Gachibowli Grand',
    city: 'Hyderabad',
    address: 'Gachibowli, Hyderabad, Telangana',
    description: 'A sample premium stay in Gachibowli.',
    starRating: 4,
    amenities: ['Wi-Fi', 'Restaurant', 'Swimming Pool', 'Parking'],
    image:
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=85',
    rooms: createRooms('Gachibowli Grand', 2200,
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=85'),
  },
  {
    name: 'The Stay Gachibowli Comfort',
    city: 'Hyderabad',
    address: 'Gachibowli, Hyderabad, Telangana',
    description: 'A sample comfortable hotel for business and family stays.',
    starRating: 3,
    amenities: ['Wi-Fi', 'Parking', 'Air Conditioning'],
    image:
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=85',
    rooms: createRooms('Gachibowli Comfort', 1800,
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=85'),
  },

  // HITEC City: one additional hotel.
  {
    name: 'The Stay HITEC Select',
    city: 'Hyderabad',
    address: 'HITEC City, Hyderabad, Telangana',
    description: 'A sample contemporary hotel near the technology district.',
    starRating: 4,
    amenities: ['Wi-Fi', 'Restaurant', 'Parking', 'Gym'],
    image:
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85',
    rooms: createRooms('HITEC Select', 2100,
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85'),
  },

  // Banjara Hills: two new hotels.
  {
    name: 'The Stay Banjara Retreat',
    city: 'Hyderabad',
    address: 'Banjara Hills, Hyderabad, Telangana',
    description: 'A sample relaxing city stay in Banjara Hills.',
    starRating: 5,
    amenities: ['Wi-Fi', 'Restaurant', 'Swimming Pool', 'Parking', 'Spa'],
    image:
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=85',
    rooms: createRooms('Banjara Retreat', 2600,
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=85'),
  },
  {
    name: 'The Stay Banjara Residency',
    city: 'Hyderabad',
    address: 'Banjara Hills, Hyderabad, Telangana',
    description: 'A sample premium city residence in Banjara Hills.',
    starRating: 4,
    amenities: ['Wi-Fi', 'Restaurant', 'Parking', 'Room Service'],
    image:
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=85',
    rooms: createRooms('Banjara Residency', 2300,
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=85'),
  },

  // Kukatpally: one additional hotel.
  {
    name: 'The Stay Kukatpally Comfort',
    city: 'Hyderabad',
    address: 'Kukatpally, Hyderabad, Telangana',
    description: 'A sample comfortable stay in Kukatpally.',
    starRating: 3,
    amenities: ['Wi-Fi', 'Parking', 'Air Conditioning'],
    image:
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=85',
    rooms: createRooms('Kukatpally Comfort', 1600,
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=85'),
  },
]

async function seedHotels() {
  try {
    await connectDB()

    for (const hotelData of sampleHotels) {
      // Add the hotel if it does not exist.
      // Otherwise, update the existing record without changing its ID.
      const hotel = await Hotel.findOneAndUpdate(
        {
          name: hotelData.name,
          city: hotelData.city,
        },
        {
          $set: {
            name: hotelData.name,
            city: hotelData.city,
            address: hotelData.address,
            description: hotelData.description,
            starRating: hotelData.starRating,
            amenities: hotelData.amenities,
            images: [hotelData.image],
            isActive: true,
          },
        },
        {
          returnDocument: 'after',
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      )

      console.log(`Hotel ready: ${hotel.name}`)

      // Add or update the five rooms belonging to this hotel.
      for (const roomData of hotelData.rooms) {
        const room = await Room.findOneAndUpdate(
          {
            hotel: hotel._id,
            name: roomData.name,
          },
          {
            $set: {
              hotel: hotel._id,
              name: roomData.name,
              roomType: roomData.roomType,
              capacity: roomData.capacity,
              pricePerNight: roomData.pricePerNight,
              description:
                roomData.description || `${roomData.roomType} room with comfortable facilities.`,
              amenities: roomData.amenities,
              images: roomData.images || [hotelData.image],
              isActive: true,
            },
          },
          {
            returnDocument: 'after',
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true,
          }
        )

        console.log(`  Room ready: ${room.name}`)
      }
    }

    // Verify the final active Hyderabad inventory.
    const hyderabadHotels = await Hotel.find({
      city: 'Hyderabad',
      isActive: true,
    }).select('_id name address')

    let totalRooms = 0

    console.log('\n--- Hyderabad inventory verification ---')

    for (const hotel of hyderabadHotels) {
      const roomCount = await Room.countDocuments({
        hotel: hotel._id,
        isActive: true,
      })

      totalRooms += roomCount

      console.log(`${hotel.name}: ${roomCount} active rooms`)
    }

    console.log('\nTotal active Hyderabad hotels:', hyderabadHotels.length)
    console.log('Total active Hyderabad rooms:', totalRooms)

    if (hyderabadHotels.length === 10 && totalRooms === 50) {
      console.log('\nSUCCESS: Hyderabad inventory is exactly 10 hotels and 50 rooms.')
    } else {
      console.warn(
        '\nCHECK REQUIRED: Expected 10 hotels and 50 rooms. Review the counts above.'
      )
    }
  } catch (error) {
    console.error('Seeding failed:', error.message)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
  }
}

seedHotels()
