import { useState, useEffect } from "react";
import type { MediaItem } from "../../App.js";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Keyboard, Navigation } from 'swiper/modules';
import { useMedia } from "../../hooks/useMedia.js";
import 'swiper/css';
import 'swiper/css/navigation';

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
  const { isMobile, isTablet } = useMedia();
  const currentMedia = media[currentIndex] ?? { src: "", title: "", description: "" };

  const isMobileView = isMobile || isTablet;
  const goToPrevious = () => setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  const goToNext = () => setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));

  // Keyboard navigation for desktop
  useEffect(() => {
    if (isMobileView) return;

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
  }, [isMobileView, goToPrevious, goToNext, onClose]);

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

      <div className="flex-1 flex flex-col items-center justify-center relative">
        {isMobileView ? (
          <Swiper
            modules={[Keyboard, Navigation]}
            initialSlide={initialIndex}
            keyboard={{ enabled: true }}
            loop={media.length > 1}
            onSlideChange={(swiper) => setCurrentIndex(swiper.realIndex)}
            className="w-full h-full"
          >
            {media.map((mediaItem, index) => (
              <SwiperSlide key={index} className="flex items-center justify-center">
                <MediaViewer mediaItem={mediaItem} />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}

function GalleryHeader({ currentIndex, mediaItem, total, onClose }: GalleryHeaderProps) {
  return (
    <div className="flex justify-between items-center p-4 border-b border-grey-200 gap-4">
      <span className="text-grey-500 text-sm whitespace-nowrap">
        {currentIndex + 1} / {total}
      </span>

      {mediaItem.description && (
        <p className="text-sm text-grey-500 text-center flex-1 max-w-2xl mx-auto">
          {mediaItem.description}
        </p>
      )}

      <button
        onClick={onClose}
        className="text-grey-500 hover:text-grey-900 text-sm transition-colors whitespace-nowrap"
        aria-label="Close gallery"
      >
        Close
      </button>
    </div>
  );
}

function MediaViewer({ mediaItem }: { mediaItem: MediaItem }) {
  const [currentSrc, setCurrentSrc] = useState<string>(() => getLightboxSrc(mediaItem.src));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setCurrentSrc(getLightboxSrc(mediaItem.src));
    setIsLoading(true);
  }, [mediaItem.src]);

  const isVideo = /\.(webm|mp4|mov|m4v|ogg)$/i.test(currentSrc);

  const handleError = () => {
    setCurrentSrc(mediaItem.src);
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center w-full h-full min-h-0 min-w-0 p-4 relative overflow-y-auto">
      {isLoading && (
        <div className="absolute flex items-center justify-center">
          <div className="flex items-center gap-2" aria-label="Loading media">
            <span className="h-2 w-2 rounded-full bg-grey-900 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="h-2 w-2 rounded-full bg-grey-900 animate-bounce" style={{ animationDelay: "120ms" }} />
            <span className="h-2 w-2 rounded-full bg-grey-900 animate-bounce" style={{ animationDelay: "240ms" }} />
          </div>
        </div>
      )}
      {isVideo ? (
        <video
          key={currentSrc}
          src={currentSrc}
          controls
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="max-w-full h-full w-auto object-contain"
          aria-label={mediaItem.title || mediaItem.description || 'Gallery video'}
          onError={handleError}
          onLoadedData={() => setIsLoading(false)}
        />
      ) : (
        <img
          key={currentSrc}
          src={currentSrc}
          alt={mediaItem.title}
          loading="lazy"
          className="max-w-full h-full w-auto object-contain"
          draggable={false}
          onError={handleError}
          onLoad={() => setIsLoading(false)}
        />
      )}
    </div>
  );
}

function Lightbox({ mediaItem, onPrevious, onNext }: LightboxProps) {
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
    <div className="flex flex-col items-center justify-center min-w-0 min-h-0 w-full">
      <div
        className="flex items-center justify-center min-w-0 min-h-0 p-10 flex-1 cursor-pointer select-none w-full"
        onClick={handleContainerClick}
      >
        <div
          className="w-full h-full min-w-0 min-h-0 flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <MediaViewer mediaItem={mediaItem} />
        </div>
      </div>
    </div>
  );
}

function NavigationArrows({ onPrevious, onNext, showNavigation }: NavigationArrowsProps) {
  if (!showNavigation) return null;

  const arrowClass = "absolute top-0 bottom-0 w-1/3 flex items-center text-grey-500 hover:text-grey-900 transition-colors group cursor-pointer";
  const svgClass = "opacity-60 group-hover:opacity-100 transition-opacity";
  const iconClass = "h-9 w-9 rounded-full border border-grey-300/60 bg-grey-100/80 backdrop-blur-md flex items-center justify-center transition-colors group-hover:border-grey-400 group-hover:text-grey-900";

  return (
    <>
      <button
        onClick={onPrevious}
        className={`${arrowClass} left-0 justify-start pl-4`}
        aria-label="Previous"
      >
        <span className={iconClass}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={svgClass}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </span>
      </button>
      <button
        onClick={onNext}
        className={`${arrowClass} right-0 justify-end pr-4`}
        aria-label="Next"
      >
        <span className={iconClass}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={svgClass}>
            <path d="M9 18l6-6-6-6" />
          </svg>
        </span>
      </button>
    </>
  );
}
