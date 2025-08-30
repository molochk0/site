# Database Seeding Guide

This guide explains how to populate the restaurant website database with initial data for development and testing.

## Overview

The seeding system provides comprehensive test data for:
- **User accounts** (admin user with credentials)
- **Promotions** (restaurant offers and discounts)
- **Events** (special restaurant events and activities)
- **Content** (hero sections, about page, contact info, menu preview)

## Available Seeding Methods

### 1. Database Seeding (Production)

**File:** `prisma/seed.ts`  
**Usage:** When PostgreSQL database is available

```bash
# Run database seeding
npm run db:seed

# Reset database and reseed
npm run db:reset
```

**Features:**
- Connects to PostgreSQL via Prisma
- Creates real database records
- Includes data relationships and constraints
- Safe upsert operations (won't duplicate data)

### 2. Local Mock Data Generation

**File:** `prisma/seed-local.ts`  
**Usage:** For development when database is not available

```bash
# Generate JSON mock data files
npm run db:seed:local
```

**Features:**
- Creates JSON files in `/data` directory
- No database connection required
- Can be used as fallback data source
- Perfect for development and testing

## Generated Data

### Admin User
- **Email:** `admin@restaurant.com`
- **Password:** `admin123`
- **Role:** `admin`
- **Access:** Full admin panel access

### Promotions (6 items)
1. **Скидка на бизнес-ланч** - 20% weekday lunch discount
2. **Вечер романтики** - 25% romantic dinner for two
3. **Семейный ужин** - 15% family dinner discount
4. **День рождения** - 20% birthday special
5. **Счастливые часы** - 30% happy hour drinks
6. **Воскресный бранч** - 18% Sunday brunch menu

### Events (6 items)
1. **Мастер-класс от шеф-повара** - Cooking masterclass
2. **Винный ужин с сомелье** - Wine tasting dinner
3. **Ночь джаза** - Live jazz night
4. **Дегустационное меню** - Spring collection tasting
5. **День открытых дверей** - Kitchen tour event
6. **Кулинарный поединок** - Chef competition show

### Content Sections
1. **Hero Section** - Homepage banner with CTA
2. **About Section** - Restaurant story and features
3. **Contact Section** - Location, hours, contact info
4. **Menu Preview** - Sample menu categories and dishes
5. **Restaurant Info** - General restaurant information

## Data Structure

### Promotions
```json
{
  "id": "unique-id",
  "title": "Promotion Title",
  "description": "Detailed description",
  "discount": 20,
  "validFrom": "2024-01-01T00:00:00.000Z",
  "validUntil": "2024-12-31T23:59:59.000Z",
  "image": "https://example.com/image.jpg",
  "isActive": true
}
```

### Events
```json
{
  "id": "unique-id",
  "title": "Event Title",
  "description": "Event description",
  "date": "2024-02-15T00:00:00.000Z",
  "time": "18:00",
  "capacity": 12,
  "image": "https://example.com/image.jpg",
  "isPublished": true
}
```

### Content
```json
{
  "id": "unique-id",
  "key": "hero",
  "value": {
    "title": "Welcome Title",
    "subtitle": "Subtitle",
    "description": "Description text",
    "backgroundImage": "https://example.com/bg.jpg"
  }
}
```

## Usage in Development

### With Database Connection
When PostgreSQL is available:
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database
npm run db:seed
```

### Without Database Connection
For local development:
```bash
# Generate mock data files
npm run db:seed:local
```

Then use the generated JSON files in your API routes:
```typescript
// Example: Using mock data in API route
import promotions from '@/data/promotions.json'

export async function GET() {
  return Response.json({ success: true, data: promotions })
}
```

## Mock Data Files

Generated files in `/data` directory:
- `promotions.json` - All promotion data
- `events.json` - All event data  
- `content.json` - All content sections
- `users.json` - Admin user data
- `seed-data.json` - Combined data file

## API Integration

### Promotions API
- `GET /api/promotions` - Fetch all promotions
- Uses seeded promotion data

### Events API  
- `GET /api/events` - Fetch all events
- Uses seeded event data

### Content API
- `GET /api/content` - Fetch content sections
- Uses seeded content data

## Testing with Seeded Data

The seeded data includes:
- **Active promotions** for testing promotion display
- **Published events** for testing event listings
- **Complete content** for testing all page sections
- **Admin user** for testing authentication

## Production Deployment

For production:
1. Ensure database is properly configured
2. Run migrations: `npm run db:migrate:deploy`  
3. Seed production data: `npm run db:seed`
4. Verify admin user creation
5. Test API endpoints

## Customization

### Adding New Data
Edit `prisma/seed.ts` to add more:
- Promotions in the `promotions` array
- Events in the `events` array
- Content sections in the `contentData` array

### Modifying Existing Data
Update the arrays in `seed.ts` with your:
- Restaurant information
- Actual promotions and events
- Real contact details and content

### Images
Default seed uses Unsplash images. Replace with:
- Your restaurant photos
- Cloudinary URLs (if configured)
- Local asset paths

## Troubleshooting

### Database Connection Issues
If seeding fails with connection errors:
1. Check `DATABASE_URL` in `.env`
2. Verify database is running
3. Use `npm run db:seed:local` as fallback

### Permission Errors
If admin login doesn't work:
1. Check user was created in database
2. Verify password hashing
3. Check NextAuth configuration

### Missing Data
If API returns empty results:
1. Check seeding completed successfully
2. Verify Prisma client is updated
3. Check API route implementations

## Development Workflow

Recommended seeding workflow:
```bash
# Initial setup
npm run db:generate
npm run db:push
npm run db:seed

# During development
npm run db:seed:local  # For quick mock data

# Reset when needed
npm run db:reset       # Clears and reseeds database
```

## Best Practices

1. **Always backup** production data before seeding
2. **Use environment checks** to prevent accidental production seeding
3. **Update seed data** regularly to reflect current restaurant info
4. **Test both seeding methods** to ensure compatibility
5. **Version control** your seed data changes

The seeding system ensures your restaurant website has rich, realistic data for development, testing, and initial production deployment.