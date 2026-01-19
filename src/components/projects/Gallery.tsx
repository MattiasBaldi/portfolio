import { useState, useEffect } from "react";
import type { MediaItem } from "../../App.js";

// Convert marquee path to lightbox path for higher quality version
function getLightboxSrc(marqueeSrc: string): string {
  return marqueeSrc.replace('/marquee/', '/lightbox/');
}

interface GalleryProps {
  media: MediaItem[];
  initialIndex?: number;
  onClose: () => void;
}

interface LightboxProps {
  mediaItem: MediaItem;
  onPrevious: () => void;
  onNext: () => void;
}

interface GalleryHeaderProps {
  currentIndex: number;
  total: number;
  mediaItem: MediaItem;
  onClose: () => void;
}

interface NavigationArrowsProps {
  onPrevious: () => void;
  onNext: () => void;
  showNavigation: boolean;
}

export function Gallery({ media, initialIndex = 0, onClose }: GalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const currentMedia = media[currentIndex] ?? { src: "", title: "", description: "" };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
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
      <GalleryHeader
        currentIndex={currentIndex}
        total={media.length}
        mediaItem={currentMedia}
        onClose={onClose}
      />

      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
        <Lightbox
          mediaItem={currentMedia}
          onPrevious={goToPrevious}
          onNext={goToNext}
        />

        {media.length > 1 && (
          <NavigationArrows
            onPrevious={goToPrevious}
            onNext={goToNext}
            showNavigation={media.length > 1}
          />
        )}
      </div>
    </div>
  );
}

function GalleryHeader({ currentIndex, mediaItem, total, onClose }: GalleryHeaderProps) {
  return (
    <div className="flex justify-between items-center p-4 border-b border-grey-200">
      <span className="text-grey-500 text-sm">
        {currentIndex + 1} / {total}
      </span>

   {(mediaItem.description) && (
        <div className="text-center py-2 w-fit max-w-2xl">
          {mediaItem.description && (
            <p className="text-sm text-grey-500 mt-1">{mediaItem.description}</p>
          )}
        </div>
      )}
 

      <button
        onClick={onClose}
        className="text-grey-500 hover:text-grey-900 text-sm transition-colors"
        aria-label="Close gallery"
      >
        Close
      </button>
    </div>
  );
}

function Lightbox({ mediaItem, onPrevious, onNext }: LightboxProps) {
  // Use lightbox version for higher quality
  const lightboxSrc = getLightboxSrc(mediaItem.src);
  const isVideo = /\.(webm|mp4|mov|m4v|ogg)$/i.test(lightboxSrc);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const clickX = e.clientX - rect.left;

    if (clickX < centerX) {
      onPrevious();
    } else {
      onNext();
    }
  };

  return (
    <div className="flex flex-col max-h-[90vh] items-start justify-center min-w-0 min-h-0 flex-1 w-full gap-3">

      <div
        className="flex items-center justify-center min-w-0 min-h-0 max-h-[80vh] padding-10 flex-1 overflow-auto cursor-pointer select-none w-full"
        onClick={handleContainerClick}
      >

        {isVideo ? (
          <video
            key={lightboxSrc}
            src={lightboxSrc}
            controls
            autoPlay
            className="max-w-full max-h-full pointer-events-none select-none"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <img
            key={lightboxSrc}
            src={lightboxSrc}
            alt={mediaItem.title}
            className="max-w-full max-h-full pointer-events-none select-none drag-none"
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />
        )}
      </div>

    </div>
  );
}

function NavigationArrows({ onPrevious, onNext, showNavigation }: NavigationArrowsProps) {
  if (!showNavigation) return null;

  return (
    <>
      <button
        onClick={onPrevious}
        className="hover:cursor-pointer absolute left-0 top-0 bottom-0 w-1/4 flex items-center justify-start pl-4 text-grey-500 hover:text-grey-900 transition-colors group"
        aria-label="Previous"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-0 group-hover:opacity-100 transition-opacity">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        onClick={onNext}
        className="hover:cursor-pointer absolute right-0 top-0 bottom-0 w-1/4 flex items-center justify-end pr-4 text-grey-500 hover:text-grey-900 transition-colors group"
        aria-label="Next"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-0 group-hover:opacity-100 transition-opacity">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </>
  );
}