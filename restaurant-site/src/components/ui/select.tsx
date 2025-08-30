import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline'

const selectVariants = cva(
  'flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus:ring-primary-500 focus:border-primary-500',
        error: 'border-red-500 focus:ring-red-500 focus:border-red-500',
        success: 'border-green-500 focus:ring-green-500 focus:border-green-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'>,
    VariantProps<typeof selectVariants> {
  label?: string
  error?: string
  helperText?: string
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className, 
    variant,
    label,
    error,
    helperText,
    options,
    value,
    onChange,
    placeholder = 'Select an option...',
    ...props 
  }, ref) => {
    const finalVariant = error ? 'error' : variant

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e.target.value)
      }
    }

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <select
            className={cn(selectVariants({ variant: finalVariant }), 'appearance-none pr-8', className)}
            ref={ref}
            value={value}
            onChange={handleChange}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          <ChevronDownIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
        
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

Select.displayName = 'Select'

// Custom Select with better styling (using Headless UI)
interface CustomSelectProps extends Omit<SelectProps, 'className'> {
  className?: string
}

const CustomSelect = React.forwardRef<HTMLDivElement, CustomSelectProps>(
  ({ 
    label,
    error,
    helperText,
    options,
    value,
    onChange,
    placeholder = 'Select an option...',
    disabled,
    required,
    className
  }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [selectedOption, setSelectedOption] = React.useState<SelectOption | null>(
      options.find(opt => opt.value === value) || null
    )

    React.useEffect(() => {
      setSelectedOption(options.find(opt => opt.value === value) || null)
    }, [value, options])

    const handleSelect = (option: SelectOption) => {
      setSelectedOption(option)
      setIsOpen(false)
      if (onChange) {
        onChange(option.value)
      }
    }

    const finalVariant = error ? 'error' : 'default'

    return (
      <div className={cn('w-full', className)} ref={ref}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <button
            type="button"
            className={cn(
              selectVariants({ variant: finalVariant }),
              'cursor-pointer text-left',
              disabled && 'cursor-not-allowed opacity-50'
            )}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
          >
            <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronDownIcon 
              className={cn(
                'h-4 w-4 text-gray-400 transition-transform',
                isOpen && 'transform rotate-180'
              )} 
            />
          </button>
          
          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between',
                    option.disabled && 'opacity-50 cursor-not-allowed',
                    selectedOption?.value === option.value && 'bg-primary-50 text-primary-600'
                  )}
                  onClick={() => !option.disabled && handleSelect(option)}
                  disabled={option.disabled}
                >
                  <span>{option.label}</span>
                  {selectedOption?.value === option.value && (
                    <CheckIcon className="h-4 w-4 text-primary-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <p className={cn(
            'mt-2 text-sm',
            error ? 'text-red-600' : 'text-gray-500'
          )}>
            {error || helperText}
          </p>
        )}
        
        {/* Backdrop to close dropdown */}
        {isOpen && (
          <div
            className="fixed inset-0 z-0"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    )
  }
)

CustomSelect.displayName = 'CustomSelect'

export { Select, CustomSelect, selectVariants }