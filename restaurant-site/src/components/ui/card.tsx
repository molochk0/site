import * as React from 'react'
import { motion, MotionProps } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const cardVariants = cva(
  'rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-white border-gray-200',
        elevated: 'bg-white border-gray-200 shadow-lg',
        outlined: 'bg-transparent border-2 border-gray-200',
        filled: 'bg-gray-50 border-gray-200',
        gradient: 'bg-gradient-to-br from-primary-50 to-accent-50 border-primary-200',
        glass: 'bg-white/80 backdrop-blur-sm border-white/20',
      },
      size: {
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
      },
      hover: {
        none: '',
        lift: 'hover:shadow-lg hover:-translate-y-1',
        glow: 'hover:shadow-primary-200 hover:shadow-lg',
        scale: 'hover:scale-105',
      },
      rounded: {
        default: 'rounded-lg',
        sm: 'rounded-md',
        lg: 'rounded-xl',
        xl: 'rounded-2xl',
        full: 'rounded-3xl',
        none: 'rounded-none',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      hover: 'none',
      rounded: 'default',
    },
  }
)

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  animate?: boolean
  motionProps?: MotionProps
  clickable?: boolean
  onCardClick?: () => void
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant, 
    size, 
    hover,
    rounded,
    animate = false,
    motionProps,
    clickable = false,
    onCardClick,
    children,
    ...props 
  }, ref) => {
    const cardClasses = cn(
      cardVariants({ variant, size, hover, rounded }),
      clickable && 'cursor-pointer',
      className
    )

    const handleClick = () => {
      if (clickable && onCardClick) {
        onCardClick()
      }
    }

    if (animate) {
      return (
        <motion.div
          ref={ref}
          className={cardClasses}
          onClick={handleClick}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={clickable ? { scale: 1.02 } : {}}
          whileTap={clickable ? { scale: 0.98 } : {}}
          transition={{ duration: 0.3 }}
          {...motionProps}
          {...props}
        >
          {children}
        </motion.div>
      )
    }

    return (
      <div
        ref={ref}
        className={cardClasses}
        onClick={handleClick}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 pb-6', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  }
>(({ className, as: Comp = 'h3', ...props }, ref) => (
  <Comp
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight font-display',
      className
    )}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground text-gray-600', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-6', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

// Specialized Cards for Restaurant

interface ImageCardProps extends CardProps {
  image: string
  imageAlt: string
  imagePosition?: 'top' | 'left' | 'right' | 'background'
}

const ImageCard = React.forwardRef<HTMLDivElement, ImageCardProps>(
  ({ 
    image, 
    imageAlt, 
    imagePosition = 'top',
    children, 
    className,
    ...props 
  }, ref) => {
    if (imagePosition === 'background') {
      return (
        <Card
          ref={ref}
          className={cn('relative overflow-hidden', className)}
          {...props}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${image})` }}
          />
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10">
            {children}
          </div>
        </Card>
      )
    }

    if (imagePosition === 'top') {
      return (
        <Card ref={ref} className={cn('overflow-hidden', className)} {...props}>
          <div className="aspect-video w-full">
            <img
              src={image}
              alt={imageAlt}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6">
            {children}
          </div>
        </Card>
      )
    }

    return (
      <Card ref={ref} className={cn('flex', className)} {...props}>
        {imagePosition === 'left' && (
          <div className="w-1/3">
            <img
              src={image}
              alt={imageAlt}
              className="w-full h-full object-cover rounded-l-lg"
            />
          </div>
        )}
        <div className="flex-1 p-6">
          {children}
        </div>
        {imagePosition === 'right' && (
          <div className="w-1/3">
            <img
              src={image}
              alt={imageAlt}
              className="w-full h-full object-cover rounded-r-lg"
            />
          </div>
        )}
      </Card>
    )
  }
)

ImageCard.displayName = 'ImageCard'

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  ImageCard,
  cardVariants,
  type CardProps 
}