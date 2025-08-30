/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXTAUTH_URL || 'https://your-domain.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: [
    '/admin/*',
    '/api/*',
    '/server-sitemap.xml',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api',
          '/_next',
          '/static',
        ],
      },
    ],
    additionalSitemaps: [
      `${process.env.NEXTAUTH_URL || 'https://your-domain.com'}/server-sitemap.xml`,
    ],
  },
  transform: async (config, path) => {
    // Custom priority and changefreq for different pages
    const customConfig = {
      loc: path,
      changefreq: 'daily',
      priority: 0.7,
      lastmod: new Date().toISOString(),
    }

    // Higher priority for important pages
    if (path === '/') {
      customConfig.priority = 1.0
      customConfig.changefreq = 'daily'
    } else if (path.includes('/promotions') || path.includes('/events')) {
      customConfig.priority = 0.8
      customConfig.changefreq = 'weekly'
    } else if (path.includes('/menu') || path.includes('/about')) {
      customConfig.priority = 0.9
      customConfig.changefreq = 'monthly'
    }

    return customConfig
  },
}