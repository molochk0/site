import * as React from 'react'
import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { PhotoIcon, XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import NextImage from 'next/image'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  onUpload: (imageUrl: string) => void
  onDelete?: (publicId: string) => void
  currentImage?: string
  currentPublicId?: string
  placeholder?: string
  className?: string
  accept?: string
  maxSize?: number // in MB
  folder?: string
  disabled?: boolean
}

export function ImageUpload({
  onUpload,
  onDelete,
  currentImage,
  currentPublicId,
  placeholder = 'Click to upload an image',
  className,
  accept = 'image/*',
  maxSize = 10,
  folder = 'general',
  disabled = false
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSize) {
      alert(`File size must be less than ${maxSize}MB`)
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        onUpload(result.data.url)
      } else {
        alert(result.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }, [onUpload, maxSize, folder])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)

    const files = event.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleDelete = async () => {
    if (!currentPublicId || !onDelete) return

    setDeleting(true)

    try {
      const response = await fetch(
        `/api/admin/upload?publicId=${encodeURIComponent(currentPublicId)}`,
        {
          method: 'DELETE',
        }
      )

      const result = await response.json()

      if (result.success) {
        onDelete(currentPublicId)
      } else {
        alert(result.error || 'Failed to delete image')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete image')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className={cn('w-full', className)}>
      {currentImage ? (
        <div className="relative group">
          <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100">
            <NextImage
              src={currentImage}
              alt="Uploaded"
              fill
              className="object-cover"
            />
          </div>
          
          <div className="absolute top-2 right-2 flex space-x-2">
            {onDelete && currentPublicId && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                loading={deleting}
                disabled={disabled}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <Button
              variant="secondary"
              onClick={() => document.getElementById('file-input')?.click()}
              disabled={uploading || disabled}
              loading={uploading}
            >
              <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
              Change Image
            </Button>
          </div>
        </div>
      ) : (
        <motion.div
          className={cn(
            'border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-primary-400 hover:bg-primary-50/50',
            dragOver && 'border-primary-500 bg-primary-50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && document.getElementById('file-input')?.click()}
          whileHover={{ scale: disabled ? 1 : 1.01 }}
          whileTap={{ scale: disabled ? 1 : 0.99 }}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <PhotoIcon className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2">{placeholder}</p>
              <p className="text-xs text-gray-400">
                Drag and drop or click to select • Max {maxSize}MB
              </p>
            </div>
          )}
        </motion.div>
      )}

      <input
        id="file-input"
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading || disabled}
      />
    </div>
  )
}