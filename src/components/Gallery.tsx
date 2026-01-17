import { useState, useEffect, useRef } from "react";

interface GalleryProps {
  media: string[];
  initialIndex?: number;
  onClose: () => void;
}

export function Gallery({ media, initialIndex = 0, onClose }: GalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentMedia = media[currentIndex];
  const isVideo = /\.(webm|mp4|mov|m4v|ogg)$/i.test(currentMedia);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [media.length, onClose]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      className="fixed inset-0 bg-grey-100 z-50 flex flex-col"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-grey-200">
        <span className="text-grey-500 text-sm">
          {currentIndex + 1} / {media.length}
        </span>
        <button
          onClick={onClose}
          className="text-grey-500 hover:text-grey-900 text-sm transition-colors"
          aria-label="Close gallery"
        >
          Close
        </button>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        {/* Media display */}
        {isVideo ? (
          <video
            ref={videoRef}
            key={currentMedia}
            src={currentMedia}
            controls
            autoPlay
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <img
            key={currentMedia}
            src={currentMedia}
            alt={`Gallery item ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />
        )}

        {/* Navigation arrows */}
        {media.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-grey-500 hover:text-grey-900 transition-colors p-2"
              aria-label="Previous"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-grey-500 hover:text-grey-900 transition-colors p-2"
              aria-label="Next"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
