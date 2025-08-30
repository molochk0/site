# Deployment Checklist

Use this checklist to ensure your restaurant website is ready for production deployment.

## 🔧 Pre-Deployment Setup

### Environment Configuration
- [ ] Copy `.env.example` to `.env.production`
- [ ] Set production `DATABASE_URL`
- [ ] Configure `NEXTAUTH_URL` with production domain
- [ ] Generate secure `NEXTAUTH_SECRET` (use: `openssl rand -base64 32`)
- [ ] Set up Cloudinary credentials (optional)
- [ ] Configure email SMTP settings (optional)

### Database Setup
- [ ] Create production PostgreSQL database
- [ ] Test database connection
- [ ] Run migrations: `npm run db:migrate:deploy`
- [ ] Seed initial data: `npm run db:seed`
- [ ] Verify admin user creation

### Security
- [ ] Review and update all secrets
- [ ] Ensure environment variables are secure
- [ ] Test admin login functionality
- [ ] Verify API endpoint protection

## 🚀 Build & Test

### Build Process
- [ ] Run type check: `npm run type-check`
- [ ] Run linting: `npm run lint`
- [ ] Run unit tests: `npm run test:ci`
- [ ] Build production: `npm run build`
- [ ] Test production build: `npm start`

### Performance Validation
- [ ] Run Lighthouse audit: `npm run lighthouse:local`
- [ ] Check Core Web Vitals scores
- [ ] Verify image optimization
- [ ] Test mobile responsiveness
- [ ] Validate accessibility compliance

### Functionality Testing
- [ ] Test homepage loading
- [ ] Verify promotions display
- [ ] Check events section
- [ ] Test admin login
- [ ] Test admin panel features
- [ ] Verify API endpoints

## 🐳 Deployment Options

### Option 1: Docker Deployment
- [ ] Build Docker image: `docker build -t restaurant-site .`
- [ ] Test Docker container: `docker run -p 3000:3000 restaurant-site`
- [ ] Push to container registry
- [ ] Deploy to production server

### Option 2: Vercel Deployment
- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Login to Vercel: `vercel login`
- [ ] Deploy: `npm run deploy:vercel`
- [ ] Set environment variables in Vercel dashboard
- [ ] Test deployed application

### Option 3: Traditional Hosting
- [ ] Upload built files to server
- [ ] Configure web server (Nginx/Apache)
- [ ] Set environment variables
- [ ] Start Node.js process
- [ ] Configure process manager (PM2)

## 📊 Post-Deployment Verification

### Functionality Check
- [ ] Homepage loads correctly
- [ ] All sections display properly
- [ ] Images load and are optimized
- [ ] Admin panel is accessible
- [ ] Authentication works
- [ ] API endpoints respond correctly

### Performance Check
- [ ] Page load times < 3 seconds
- [ ] Core Web Vitals in good range
- [ ] Mobile performance acceptable
- [ ] No console errors
- [ ] Performance monitoring active

### SEO & Accessibility
- [ ] Meta tags present
- [ ] Sitemap accessible
- [ ] Robots.txt configured
- [ ] Accessibility standards met
- [ ] Social media previews work

## 🔍 Monitoring Setup

### Performance Monitoring
- [ ] Lighthouse CI configured
- [ ] Performance dashboard accessible
- [ ] Real User Monitoring active
- [ ] Alert thresholds configured

### Error Tracking
- [ ] Error logging configured
- [ ] Performance alerts set up
- [ ] Uptime monitoring enabled
- [ ] Backup procedures in place

### Analytics (Optional)
- [ ] Google Analytics configured
- [ ] Search Console set up
- [ ] Social media tracking
- [ ] Conversion tracking enabled

## 🔧 Domain & SSL

### Domain Configuration
- [ ] Domain pointed to server/service
- [ ] DNS records configured
- [ ] WWW redirect set up
- [ ] SSL certificate installed
- [ ] HTTPS redirect enabled

## 📞 Admin Setup

### Initial Admin Configuration
- [ ] Change default admin password
- [ ] Update restaurant information
- [ ] Add real promotions and events
- [ ] Upload restaurant images
- [ ] Configure contact information

### Content Management
- [ ] Update hero section with real content
- [ ] Add actual menu items and prices
- [ ] Set correct restaurant hours
- [ ] Add real social media links
- [ ] Update about section

## 🎯 Go-Live Process

### Final Steps
1. [ ] Complete final testing
2. [ ] Backup current site (if replacing existing)
3. [ ] Switch DNS to new site
4. [ ] Monitor for issues
5. [ ] Test all functionality
6. [ ] Announce launch

### Post-Launch Monitoring
- [ ] Monitor performance metrics
- [ ] Check for errors in logs
- [ ] Verify analytics tracking
- [ ] Test admin functionality
- [ ] Monitor user feedback

## 📋 Common Issues & Solutions

### Build Issues
- **TypeScript errors:** Run `npm run type-check`
- **Missing dependencies:** Run `npm install`
- **Environment variables:** Check `.env` file

### Database Issues
- **Connection errors:** Verify `DATABASE_URL`
- **Migration failures:** Check database permissions
- **Seeding issues:** Use `npm run db:seed:local` for fallback

### Performance Issues
- **Slow loading:** Check image optimization
- **High bundle size:** Run `npm run build:analyze`
- **Poor Core Web Vitals:** Review Lighthouse recommendations

### Authentication Issues
- **Login failures:** Check `NEXTAUTH_SECRET` and `NEXTAUTH_URL`
- **Session problems:** Verify cookie settings
- **Access denied:** Check user roles and permissions

## 📱 Mobile Testing Checklist

- [ ] Test on actual mobile devices
- [ ] Verify touch interactions work
- [ ] Check mobile navigation
- [ ] Test form inputs on mobile
- [ ] Verify performance on 3G/4G

## 🚨 Emergency Procedures

### Rollback Plan
- [ ] Document rollback steps
- [ ] Keep previous version available
- [ ] Test rollback procedure
- [ ] Monitor during rollback

### Support Contacts
- [ ] Technical support contacts
- [ ] Hosting provider support
- [ ] Domain registrar support
- [ ] Emergency response plan

---

## ✅ Deployment Completion

Once all items are checked:
- [ ] Site is live and functioning
- [ ] Performance meets standards
- [ ] All functionality tested
- [ ] Monitoring systems active
- [ ] Documentation updated
- [ ] Team notified of completion

**🎉 Congratulations! Your restaurant website is successfully deployed and ready to serve customers!**