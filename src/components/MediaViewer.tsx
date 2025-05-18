// components/MediaViewer.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'

interface MediaViewerProps {
  isOpen: boolean
  onClose: () => void
  mediaItems: string[]
  initialIndex: number
}

const MediaViewer = ({ isOpen, onClose, mediaItems, initialIndex = 0 }: MediaViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isPlaying, setIsPlaying] = useState(true)
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Reset state when media changes or viewer opens
  useEffect(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
    setCurrentIndex(initialIndex)
  }, [isOpen, initialIndex])

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose()
          break
        case "ArrowLeft":
          navigatePrev()
          break
        case "ArrowRight":
          navigateNext()
          break
        case "+":
          handleZoomIn()
          break
        case "-":
          handleZoomOut()
          break
        case "0":
          resetZoom()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, currentIndex, mediaItems.length])

  // Prevent body scrolling when viewer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  if (!isOpen) return null

  const currentMedia = mediaItems[currentIndex]
  const isVideo = currentMedia?.match(/\.(mp4|webm|ogg)$/i)

  const navigateNext = () => {
    if (currentIndex < mediaItems.length - 1) {
      setCurrentIndex(currentIndex + 1)
      resetZoom()
    }
  }

  const navigatePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      resetZoom()
    }
  }

  const handleZoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.25, 5))
  }

  const handleZoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.25, 0.5))
  }

  const resetZoom = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    if (e.deltaY < 0) {
      handleZoomIn()
    } else {
      handleZoomOut()
    }
  }

  const togglePlayPause = () => {
    const videoElement = mediaRef.current as HTMLVideoElement
    if (videoElement) {
      if (isPlaying) {
        videoElement.pause()
      } else {
        videoElement.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="cursor-pointer absolute top-4 right-4 text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 z-10"
        aria-label="Close viewer"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation buttons */}
      {mediaItems.length > 1 && (
        <>
          <button
            onClick={navigatePrev}
            disabled={currentIndex === 0}
            className={`absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 z-10 ${
              currentIndex === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
            aria-label="Previous media"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={navigateNext}
            disabled={currentIndex === mediaItems.length - 1}
            className={`absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 z-10 ${
              currentIndex === mediaItems.length - 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
            aria-label="Next media"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Media container */}
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isDragging ? "grabbing" : scale > 1 ? "grab" : "default" }}
      >
        {isVideo ? (
          <>
            <video
              ref={mediaRef as React.RefObject<HTMLVideoElement>}
              src={currentMedia}
              className="max-h-full max-w-full object-contain transition-transform"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: "center",
              }}
              controls={false}
              autoPlay
              loop
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={togglePlayPause}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 z-10"
              aria-label={isPlaying ? "Pause video" : "Play video"}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
          </>
        ) : (
          <img
            ref={mediaRef as React.RefObject<HTMLImageElement>}
            src={currentMedia || "/placeholder.svg"}
            alt="Media preview"
            className="max-h-full max-w-full object-contain transition-transform"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex space-x-2">
        <button
          onClick={handleZoomOut}
          className="cursor-pointer text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70"
          aria-label="Zoom out"
          disabled={scale <= 0.5}
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={resetZoom}
          className="text-white px-3 py-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 text-sm"
          aria-label="Reset zoom"
        >
          {Math.round(scale * 100)}%
        </button>
        <button
          onClick={handleZoomIn}
          className="cursor-pointer text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70"
          aria-label="Zoom in"
          disabled={scale >= 5}
        >
          <ZoomIn className="w-5 h-5" />
        </button>
      </div>

      {/* Media counter */}
      {mediaItems.length > 1 && (
        <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {mediaItems.length}
        </div>
      )}
    </div>
  )
}

export default MediaViewer