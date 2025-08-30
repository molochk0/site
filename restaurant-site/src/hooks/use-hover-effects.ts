import { motion } from 'framer-motion'

export const hoverEffects = {
  lift: {
    whileHover: { y: -8, scale: 1.02, transition: { duration: 0.3 } },
    whileTap: { scale: 0.98 }
  },
  scale: {
    whileHover: { scale: 1.05, transition: { duration: 0.3 } },
    whileTap: { scale: 0.95 }
  },
  glow: {
    whileHover: { boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)', transition: { duration: 0.3 } }
  }
}

export const iconEffects = {
  spin: { whileHover: { rotate: 360, transition: { duration: 0.6 } } },
  pulse: { whileHover: { scale: [1, 1.2, 1], transition: { duration: 0.4 } } }
}