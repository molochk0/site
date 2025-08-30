import dynamic from 'next/dynamic'
import { Header } from '@/components/landing/header'
import { HeroSection } from '@/components/landing/hero-section'
import { LazyLoader } from '@/components/ui/lazy-loader'

// Lazy load non-critical components
const MenuPreview = dynamic(() => import('@/components/landing/menu-preview').then(mod => ({ default: mod.MenuPreview })), {
  loading: () => <LazyLoader className="h-96" />
})

const PromotionsSection = dynamic(() => import('@/components/landing/promotions-section').then(mod => ({ default: mod.PromotionsSection })), {
  loading: () => <LazyLoader className="h-96" />
})

const EventsSection = dynamic(() => import('@/components/landing/events-section').then(mod => ({ default: mod.EventsSection })), {
  loading: () => <LazyLoader className="h-96" />
})

const AboutSection = dynamic(() => import('@/components/landing/about-contact').then(mod => ({ default: mod.AboutSection })), {
  loading: () => <LazyLoader className="h-96" />
})

const ContactSection = dynamic(() => import('@/components/landing/about-contact').then(mod => ({ default: mod.ContactSection })), {
  loading: () => <LazyLoader className="h-96" />
})

const Footer = dynamic(() => import('@/components/landing/footer').then(mod => ({ default: mod.Footer })), {
  loading: () => <LazyLoader className="h-32" />
})

export default function HomePage() {
  return (
    <>
      <Header />
      <HeroSection />
      <MenuPreview />
      <PromotionsSection />
      <EventsSection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </>
  )
}
