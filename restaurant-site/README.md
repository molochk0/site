# Restaurant Website

A modern, feature-rich restaurant website built with Next.js 14, TypeScript, and Tailwind CSS. Features an elegant design, comprehensive admin panel, and performance optimization.

## 🎯 Features

### Core Requirements ✅
- ✅ **Interesting Design** - Modern, elegant interface with smooth animations
- ✅ **Mobile Adaptation** - Fully responsive design optimized for all devices
- ✅ **Admin Panel** - Complete management system for promotions, events, and content
- ✅ **TypeScript** - Full TypeScript implementation for type safety

### Key Features
- 🏠 **Landing Page** with hero section, menu preview, promotions, and events
- 👥 **Admin Dashboard** with comprehensive management tools
- 🔐 **Authentication System** with NextAuth.js and role-based access
- 📱 **Responsive Design** with touch gesture support
- ✨ **Smooth Animations** using Framer Motion
- 🚀 **Performance Optimized** with Lighthouse CI monitoring
- 🧪 **Comprehensive Testing** (Unit, E2E, Accessibility)
- 🐳 **Docker Ready** for easy deployment

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - App Router, Server Components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend
- **Prisma ORM** - Database management
- **PostgreSQL** - Primary database
- **NextAuth.js** - Authentication
- **Cloudinary** - Image optimization

### Testing & Quality
- **Jest** - Unit testing
- **React Testing Library** - Component testing
- **Playwright** - E2E testing
- **Lighthouse CI** - Performance monitoring
- **ESLint + Prettier** - Code quality

### Deployment
- **Docker** - Containerization
- **GitHub Actions** - CI/CD pipeline
- **Vercel Ready** - Easy deployment

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (optional - can use mock data)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd restaurant-site
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Setup database** (optional)
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```
   
   Or use mock data:
   ```bash
   npm run db:seed:local
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   - Website: http://localhost:3000
   - Admin: http://localhost:3000/admin

### Admin Login
- **Email:** admin@restaurant.com
- **Password:** admin123

## 📁 Project Structure

```
restaurant-site/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── admin/          # Admin panel pages
│   │   ├── api/            # API routes
│   │   └── globals.css     # Global styles
│   ├── components/         # React components
│   │   ├── admin/          # Admin components
│   │   ├── landing/        # Landing page sections
│   │   ├── providers/      # Context providers
│   │   └── ui/            # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and configurations
│   └── types/             # TypeScript type definitions
├── prisma/                # Database schema and seeds
├── tests/                 # Test files
├── docs/                  # Documentation
├── public/               # Static assets
└── data/                 # Mock data (generated)
```

## 🎨 Design System

### Colors
- **Primary:** Warm amber/gold tones
- **Secondary:** Deep reds and oranges
- **Neutral:** Modern grays
- **Accent:** Rich burgundy

### Typography
- **Headings:** Playfair Display (serif)
- **Body:** Inter (sans-serif)

### Components
- Consistent spacing and sizing
- Smooth hover and focus states
- Accessibility-compliant contrast
- Mobile-first responsive design

## 📊 Admin Panel Features

### Dashboard
- Performance metrics overview
- Recent activity summary
- Quick action buttons
- System status indicators

### Promotions Management
- Create, edit, delete promotions
- Set discount percentages and validity periods
- Upload promotion images
- Activate/deactivate promotions

### Events Management
- Schedule restaurant events
- Manage capacity and details
- Event publishing controls
- Image gallery support

### Content Management
- Edit hero section content
- Update restaurant information
- Manage contact details
- Menu preview customization

### Performance Monitoring
- Real-time Core Web Vitals
- Page load analytics
- Device and browser statistics
- Performance recommendations

## 🧪 Testing

### Unit Tests
```bash
npm test                    # Run unit tests
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage
```

### E2E Tests
```bash
npm run test:e2e           # Run all E2E tests
npm run test:e2e:ui        # Interactive mode
npm run test:performance   # Performance tests
```

### Quality Checks
```bash
npm run lint               # ESLint
npm run type-check         # TypeScript
npm run validate           # Full validation
```

## 🚀 Performance

### Optimization Features
- **Image Optimization** - Next.js Image with lazy loading
- **Code Splitting** - Automatic route and component splitting
- **Caching** - API response and static asset caching
- **Bundle Analysis** - Built-in bundle size monitoring

### Performance Budget
- **LCP:** < 2.5s
- **FID:** < 100ms  
- **CLS:** < 0.1
- **JavaScript:** < 400KB
- **Total Size:** < 1.6MB

### Monitoring
- Lighthouse CI integration
- Real User Monitoring (RUM)
- Core Web Vitals tracking
- Performance dashboard in admin

## 🐳 Deployment

### Docker Deployment
```bash
# Build and run with Docker
docker build -t restaurant-site .
docker run -p 3000:3000 restaurant-site
```

### Production Build
```bash
npm run build              # Build for production
npm start                  # Start production server
```

### Environment Configuration
See [Environment Setup Guide](./docs/ENVIRONMENT_SETUP.md) for detailed configuration.

## 📚 Documentation

- [Environment Setup](./docs/ENVIRONMENT_SETUP.md)
- [Database Seeding](./docs/DATABASE_SEEDING.md) 
- [Performance Monitoring](./docs/PERFORMANCE_MONITORING.md)

## 🧩 API Endpoints

### Public API
- `GET /api/promotions` - Fetch active promotions
- `GET /api/events` - Fetch published events
- `GET /api/content` - Fetch page content

### Admin API
- `POST /api/admin/promotions` - Create promotion
- `PUT /api/admin/promotions/[id]` - Update promotion
- `DELETE /api/admin/promotions/[id]` - Delete promotion
- `POST /api/admin/events` - Create event
- `PUT /api/admin/events/[id]` - Update event
- `DELETE /api/admin/events/[id]` - Delete event
- `PUT /api/admin/content` - Update content

### Utility API
- `POST /api/upload` - Image upload
- `POST /api/performance` - Performance metrics
- `GET /api/performance` - Performance analytics

## 🔧 Development

### Available Scripts
```bash
npm run dev                # Development server
npm run build              # Production build  
npm run start              # Production server
npm run lint               # Lint code
npm run test               # Run tests
npm run db:seed            # Seed database
npm run db:seed:local      # Generate mock data
npm run lighthouse         # Performance audit
```

### Development Workflow
1. Create feature branch
2. Implement changes with tests
3. Run quality checks: `npm run validate`
4. Submit pull request
5. Automated CI/CD pipeline runs

## 🐛 Troubleshooting

### Common Issues

**Database Connection**
- Check `DATABASE_URL` in `.env`
- Use `npm run db:seed:local` for mock data

**Build Errors**
- Run `npm run type-check` for TypeScript issues
- Check `npm run lint` for code quality

**Performance Issues**
- Run `npm run lighthouse` for audit
- Check admin performance dashboard

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙋‍♂️ Support

For support and questions:
- Check documentation in `/docs`
- Review existing issues
- Create new issue with detailed description

---

**Built with ❤️ for the restaurant industry**