"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react"
import { uploadImageToCloudinary } from "@/lib/cloudinary"

export default function ImageUpload({ 
  onImagesUploaded, 
  maxFiles = 5, 
  folder = 'stack-it',
  className = "" 
}) {
  const [uploading, setUploading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState([])
  const [previewFiles, setPreviewFiles] = useState([])
  const fileInputRef = useRef(null)

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    
    if (files.length === 0) return
    
    // Check if adding these files would exceed the limit
    if (uploadedImages.length + files.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} images`)
      return
    }

    // Create preview for selected files
    const newPreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: true
    }))
    
    setPreviewFiles(prev => [...prev, ...newPreviews])
    setUploading(true)

    try {
      // Upload all files to Cloudinary
      const uploadPromises = files.map(async (file, index) => {
        try {
          const result = await uploadImageToCloudinary(file, folder)
          
          // Update preview to show upload complete
          setPreviewFiles(prev => prev.map(preview => 
            preview.file === file 
              ? { ...preview, uploading: false, uploaded: true, result }
              : preview
          ))
          
          return result
        } catch (error) {
          console.error('Upload failed for file:', file.name, error)
          // Remove failed upload from previews
          setPreviewFiles(prev => prev.filter(preview => preview.file !== file))
          throw error
        }
      })

      const results = await Promise.all(uploadPromises)
      
      // Add successful uploads to uploaded images
      const newUploadedImages = [...uploadedImages, ...results]
      setUploadedImages(newUploadedImages)
      
      // Notify parent component
      onImagesUploaded(newUploadedImages)
      
      // Clear previews of uploaded files
      setPreviewFiles(prev => prev.filter(preview => !preview.uploaded))
      
    } catch (error) {
      console.error('Some uploads failed:', error)
    } finally {
      setUploading(false)
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = (imageToRemove) => {
    const newUploadedImages = uploadedImages.filter(img => img.publicId !== imageToRemove.publicId)
    setUploadedImages(newUploadedImages)
    onImagesUploaded(newUploadedImages)
    
    // Also remove from previews if it's there
    setPreviewFiles(prev => prev.filter(preview => 
      !preview.result || preview.result.publicId !== imageToRemove.publicId
    ))
  }

  const removePreview = (previewToRemove) => {
    // Revoke the object URL to free memory
    URL.revokeObjectURL(previewToRemove.preview)
    setPreviewFiles(prev => prev.filter(preview => preview !== previewToRemove))
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Button */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || uploadedImages.length >= maxFiles}
          className="border-border hover:bg-accent/20 hover:border-accent transition-all"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          {uploading ? 'Uploading...' : 'Upload Images'}
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <span className="text-sm text-muted-foreground">
          {uploadedImages.length}/{maxFiles} images
        </span>
      </div>

      {/* Preview Files (during upload) */}
      {previewFiles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {previewFiles.map((preview, index) => (
            <div key={index} className="relative">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                <img
                  src={preview.preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                {preview.uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  </div>
                )}
                {!preview.uploaded && !preview.uploading && (
                  <button
                    type="button"
                    onClick={() => removePreview(preview)}
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs hover:bg-destructive/80 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {uploadedImages.map((image, index) => (
              <div key={image.publicId} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                  <img
                    src={image.url}
                    alt={`Uploaded ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(image)}
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs hover:bg-destructive/80 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Helper Text */}
      <p className="text-sm text-muted-foreground">
        Upload screenshots, diagrams, or any images that help explain your question.
        Images are uploaded to Cloudinary for fast loading.
      </p>
    </div>
  )
}
