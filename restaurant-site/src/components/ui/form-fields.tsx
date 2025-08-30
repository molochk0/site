import * as React from 'react'
import { cn } from '@/lib/utils'

interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  helperText?: string
  dateFormat?: 'date' | 'datetime-local' | 'time'
}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ 
    className, 
    label,
    error,
    helperText,
    dateFormat = 'date',
    ...props 
  }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <input
          type={dateFormat}
          className={cn(
            'flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
            error 
              ? 'border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500'
              : 'border-gray-300 focus-visible:ring-primary-500 focus-visible:border-primary-500',
            className
          )}
          ref={ref}
          {...props}
        />
        
        {(error || helperText) && (
          <p className={cn(
            'mt-2 text-sm',
            error ? 'text-red-600' : 'text-gray-500'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

DatePicker.displayName = 'DatePicker'

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ 
    className, 
    label,
    error,
    helperText,
    ...props 
  }, ref) => {
    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            className={cn(
              'focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded transition-colors',
              error && 'border-red-500',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {label && (
          <div className="ml-3 text-sm">
            <label className="font-medium text-gray-700">
              {label}
              {props.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {(error || helperText) && (
              <p className={cn(
                'mt-1 text-sm',
                error ? 'text-red-600' : 'text-gray-500'
              )}>
                {error || helperText}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

interface RadioGroupProps {
  name: string
  options: Array<{
    value: string
    label: string
    disabled?: boolean
  }>
  value?: string
  onChange?: (value: string) => void
  label?: string
  error?: string
  helperText?: string
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

const RadioGroup = React.forwardRef<HTMLFieldSetElement, RadioGroupProps>(
  ({ 
    name,
    options,
    value,
    onChange,
    label,
    error,
    helperText,
    orientation = 'vertical',
    className
  }, ref) => {
    return (
      <fieldset className={cn('w-full', className)} ref={ref}>
        {label && (
          <legend className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </legend>
        )}
        
        <div className={cn(
          'space-y-3',
          orientation === 'horizontal' && 'flex space-x-6 space-y-0'
        )}>
          {options.map((option) => (
            <div key={option.value} className="flex items-center">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange?.(e.target.value)}
                disabled={option.disabled}
                className={cn(
                  'focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 transition-colors',
                  error && 'border-red-500'
                )}
              />
              <label className="ml-3 block text-sm font-medium text-gray-700">
                {option.label}
              </label>
            </div>
          ))}
        </div>
        
        {(error || helperText) && (
          <p className={cn(
            'mt-2 text-sm',
            error ? 'text-red-600' : 'text-gray-500'
          )}>
            {error || helperText}
          </p>
        )}
      </fieldset>
    )
  }
)

RadioGroup.displayName = 'RadioGroup'

export { DatePicker, Checkbox, RadioGroup }