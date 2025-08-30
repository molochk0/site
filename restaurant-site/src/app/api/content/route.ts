import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Default content for the restaurant
const defaultContent = {
  hero: {
    title: "Welcome to Our Restaurant",
    subtitle: "Experience exceptional cuisine in an elegant atmosphere",
    backgroundImage: "/images/hero-bg.jpg",
    ctaText: "Make a Reservation",
    ctaLink: "#contact"
  },
  about: {
    title: "Our Story",
    description: "We are passionate about creating memorable dining experiences with fresh ingredients, innovative recipes, and exceptional service. Our chef brings years of culinary expertise to every dish.",
    images: ["/images/about-1.jpg", "/images/about-2.jpg", "/images/about-3.jpg"]
  },
  menu: {
    title: "Our Menu",
    subtitle: "Discover our carefully crafted dishes",
    categories: [
      {
        id: "appetizers",
        name: "Appetizers",
        description: "Start your meal with our delicious starters",
        items: [
          {
            id: "1",
            name: "Bruschetta",
            description: "Toasted bread with tomatoes, garlic, and basil",
            price: 12,
            image: "/images/bruschetta.jpg",
            category: "appetizers",
            isAvailable: true,
            ingredients: ["tomatoes", "basil", "garlic", "bread"],
            allergens: ["gluten"]
          }
        ]
      }
    ]
  },
  contact: {
    address: "123 Restaurant Street, City, State 12345",
    phone: "+1 (555) 123-4567",
    email: "info@restaurant.com",
    hours: {
      "Monday": "5:00 PM - 10:00 PM",
      "Tuesday": "5:00 PM - 10:00 PM", 
      "Wednesday": "5:00 PM - 10:00 PM",
      "Thursday": "5:00 PM - 10:00 PM",
      "Friday": "5:00 PM - 11:00 PM",
      "Saturday": "4:00 PM - 11:00 PM",
      "Sunday": "4:00 PM - 9:00 PM"
    },
    socialLinks: {
      facebook: "https://facebook.com/restaurant",
      instagram: "https://instagram.com/restaurant",
      twitter: "https://twitter.com/restaurant"
    }
  }
}

export async function GET() {
  try {
    // Try to get content from database
    const contentRecords = await prisma.content.findMany()
    
    if (contentRecords.length === 0) {
      // Return default content if no content in database
      return NextResponse.json({
        success: true,
        data: defaultContent
      })
    }

    // Merge database content with default content
    const content = { ...defaultContent }
    
    contentRecords.forEach((record) => {
      const keys = record.key.split('.')
      let current: any = content
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {}
        }
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = record.value
    })

    return NextResponse.json({
      success: true,
      data: content
    })
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch content'
      },
      { status: 500 }
    )
  }
}