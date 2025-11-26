"use client"

import { useState, useRef, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { X, Upload, File as FileIcon } from "lucide-react"
import { notifications } from '@/lib/notifications'

interface FileUploadProps {
  files: File[]
  onFilesChange: (files: File[]) => void
  maxSizeMB?: number
  className?: string
}

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

export function FileUpload({ 
  files, 
  onFilesChange, 
  maxSizeMB = 40,
  className = "" 
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const validateFile = (file: File): string | null => {
    // Validar tipo de archivo
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      return `Tipo de archivo no permitido: ${file.type}. Tipos permitidos: imágenes, PDF, documentos Word/Excel`
    }

    // Validar tamaño
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return `El archivo "${file.name}" es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`
    }

    return null
  }

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return

    const validFiles: File[] = []
    const errors: string[] = []

    Array.from(newFiles).forEach((file) => {
      const error = validateFile(file)
      if (error) {
        errors.push(error)
      } else {
        // Verificar si el archivo ya existe (por nombre y tamaño)
        const exists = files.some(
          (f) => f.name === file.name && f.size === file.size
        )
        if (!exists) {
          validFiles.push(file)
        }
      }
    })

    if (errors.length > 0) {
      errors.forEach((error) => {
        notifications.error(error)
      })
    }

    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles])
    }
  }, [files, onFilesChange, maxSizeMB])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
    // Resetear el input para permitir seleccionar el mismo archivo nuevamente
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    onFilesChange(newFiles)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept={ALLOWED_TYPES.join(',')}
        />
        
        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 mb-2">
          Arrastra archivos aquí o haz clic para seleccionar
        </p>
        <p className="text-xs text-gray-500 mb-3">
          Tipos permitidos: Imágenes, PDF, Word, Excel (Máx. {maxSizeMB}MB por archivo)
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          Seleccionar archivos
        </Button>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Archivos seleccionados ({files.length})
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${file.size}-${index}`}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-200"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-8 w-8 p-0 flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

