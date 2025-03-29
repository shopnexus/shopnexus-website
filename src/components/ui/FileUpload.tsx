import { useState, useRef, useCallback } from "react"
import { Upload, X } from "lucide-react"
import * as tus from "tus-js-client"

interface FileUploadProps {
  onUploadComplete: (urls: string[]) => void
  resources: string[]
  onRemoveImage: (index: number) => void
}

const FileUpload = ({ onUploadComplete, resources, onRemoveImage }: FileUploadProps) => {
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFile = useCallback(async (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const upload = new tus.Upload(file, {
        endpoint: "http://localhost:50051/files/",
        retryDelays: [0, 3000, 5000, 10000, 20000],
        metadata: {
          filename: file.name,
          filetype: file.type,
        },
        onError: (error) => {
          console.error("Failed to upload:", error)
          reject(error)
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = Math.round((bytesUploaded / bytesTotal) * 100)
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: percentage,
          }))
        },
        onSuccess: () => {
          resolve(upload.url || "")
        },
      })
      upload.start()
    })
  }, [])

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files || files.length === 0) return

      setIsUploading(true)
      const uploadedUrls: string[] = []

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const url = await uploadFile(file)
          uploadedUrls.push(url)
        }

        onUploadComplete(uploadedUrls)
      } catch (error) {
        console.error("Error uploading files:", error)
      } finally {
        setIsUploading(false)
        setUploadProgress({})
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    },
    [uploadFile, onUploadComplete]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()

      const files = e.dataTransfer.files
      if (!files || files.length === 0) return

      setIsUploading(true)
      const uploadedUrls: string[] = []

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const url = await uploadFile(file)
          uploadedUrls.push(url)
        }

        onUploadComplete(uploadedUrls)
      } catch (error) {
        console.error("Error uploading files:", error)
      } finally {
        setIsUploading(false)
        setUploadProgress({})
      }
    },
    [uploadFile, onUploadComplete]
  )

  return (
    <div>
      <div
        className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          multiple
          accept="image/*"
        />
        <div className="flex flex-col items-center justify-center py-4">
          <Upload className="w-10 h-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">
            Drag and drop images here or click to browse
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Supported formats: JPG, PNG, GIF
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="mt-2 space-y-2">
          {Object.entries(uploadProgress).map(([filename, progress]) => (
            <div key={filename} className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500">{progress}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview */}
      {resources.length > 0 && (
        <div className="mt-4">
          <div className="flex overflow-x-auto space-x-2 py-2">
            {resources.map((image, index) => (
              <div key={index} className="relative flex-shrink-0">
                <img
                  src={image}
                  alt={`Image ${index + 1}`}
                  className="w-24 h-24 object-cover rounded-lg border"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src =
                      "https://placehold.co/150x150"
                  }}
                />
                <button
                  type="button"
                  onClick={() => onRemoveImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUpload 