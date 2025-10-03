'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, X, Image as ImageIcon, RotateCcw } from 'lucide-react'

interface ImageUploaderProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  disabled?: boolean
}

export function ImageUploader({ 
  images, 
  onImagesChange, 
  maxImages = 10, 
  disabled = false 
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList) => {
    if (disabled || uploading) return

    const fileArray = Array.from(files)
    const remainingSlots = maxImages - images.length
    const filesToUpload = fileArray.slice(0, remainingSlots)

    if (filesToUpload.length === 0) {
      alert(`Solo puedes subir hasta ${maxImages} imágenes`)
      return
    }

    setUploading(true)

    try {
      // Simulate upload - replace with actual upload logic
      const newImages = await Promise.all(
        filesToUpload.map(async (file) => {
          // This would be replaced with actual Firebase Storage upload
          await new Promise(resolve => setTimeout(resolve, 1000))
          return URL.createObjectURL(file)
        })
      )

      onImagesChange([...images, ...newImages])
    } catch (error) {
      console.error('Error uploading images:', error)
      alert('Error al subir las imágenes')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files)
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const reorderImages = (fromIndex: number, toIndex: number) => {
    const newImages = [...images]
    const [removed] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, removed)
    onImagesChange(newImages)
  }

  const canUpload = images.length < maxImages && !disabled && !uploading

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {canUpload && (
        <div
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
            dragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
          
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Upload className="h-6 w-6 text-gray-400" />
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                Arrastra imágenes aquí o haz clic para seleccionar
              </p>
              <p className="text-sm text-gray-500 mt-1">
                PNG, JPG, WEBP hasta 10MB cada una
              </p>
            </div>
            
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Seleccionar archivos
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">
              Imágenes ({images.length}/{maxImages})
            </h3>
            <Badge variant="secondary">
              Arrastra para reordenar
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden"
              >
                  <img
                    src={image}
                    alt={`Imagen ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeImage(index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Drag Handle */}
                  <div className="absolute top-2 left-2 bg-white/80 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ImageIcon className="h-3 w-3 text-gray-600" />
                  </div>
                  
                  {/* Image Number */}
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Subiendo imágenes...</span>
            <span>0%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary-500 h-2 rounded-full transition-all duration-300" style={{ width: '0%' }} />
          </div>
        </div>
      )}
    </div>
  )
}
