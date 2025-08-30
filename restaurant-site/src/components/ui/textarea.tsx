import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const textareaVariants = cva(
  'flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical transition-colors',
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus-visible:ring-primary-500 focus-visible:border-primary-500',
        error: 'border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500',
        success: 'border-green-500 focus-visible:ring-green-500 focus-visible:border-green-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  label?: string
  error?: string
  helperText?: string
  maxLength?: number
  showCharCount?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    variant,
    label,
    error,
    helperText,
    maxLength,
    showCharCount = false,
    value,
    ...props 
  }, ref) => {
    const finalVariant = error ? 'error' : variant
    const charCount = typeof value === 'string' ? value.length : 0

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <textarea
          className={cn(textareaVariants({ variant: finalVariant }), className)}
          ref={ref}
          value={value}
          maxLength={maxLength}
          {...props}
        />
        
        <div className="flex justify-between items-center mt-2">
          <div>
            {(error || helperText) && (
              <p className={cn(
                'text-sm',
                error ? 'text-red-600' : 'text-gray-500'
              )}>
                {error || helperText}
              </p>
            )}
          </div>
          
          {(showCharCount || maxLength) && (
            <p className="text-xs text-gray-500">
              {charCount}{maxLength && `/${maxLength}`}
            </p>
          )}
        </div>
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export { Textarea, textareaVariants }