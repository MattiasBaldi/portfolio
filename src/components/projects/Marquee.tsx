import { useRef } from "react";
import { InfoIcon, PlayIcon, PauseIcon, GridFourIcon, CornersOutIcon } from '@phosphor-icons/react'
import type { MediaItem } from "../../App.js";
import { useMarquee } from "@/hooks/useMarquee.js";

export type MarqueeLoopProps = {
  media: MediaItem[];
  onMediaClick?: (index: number) => void;
  show?: boolean;
};

export function Marquee({ media, onMediaClick, show }: MarqueeLoopProps) {
   const wrapper = useRef(null);
   const { toggle, isPaused } = useMarquee(wrapper, { enabled: show ?? false })
   const handleVideoMetadata = (event: React.SyntheticEvent<HTMLVideoElement>) => {
     const video = event.currentTarget
     const container = video.parentElement as HTMLDivElement | null
     if (!container) return
     const ratio = video.videoWidth > 0 && video.videoHeight > 0
       ? video.videoWidth / video.videoHeight
       : 0
     if (!ratio) return
     requestAnimationFrame(() => {
       requestAnimationFrame(() => {
         const height = container.getBoundingClientRect().height
         if (height <= 0) return
         container.style.width = `${Math.round(height * ratio)}px`
       })
     })
     if (video.readyState < 2) {
       const handleLoadedData = () => {
         video.pause()
       }
       video.addEventListener("loadeddata", handleLoadedData, { once: true })
       try {
         video.currentTime = 0.01
       } catch {
         // iOS can throw if not seekable yet.
       }
       video.load()
     }
   }

  return (
    <div className="relative">
      {/* Marquee */}
      <div
        ref={wrapper}
        onClick={(e) => e.stopPropagation()}
        className="marquee wrapper flex overflow-hidden"
        style={{
          gap: `${0}px`,
          margin: 0,
          padding: 0,
          fontSize: 0,
          lineHeight: 0,
          WebkitFontSmoothing: 'antialiased',
          transform: 'translateZ(0)', // Force GPU acceleration for smoother rendering
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
        }}
      >
        {media.map((mediaItem, i) => { 
          
          const isVideo = /\.(webm|mp4|mov|m4v|ogg)$/i.test(mediaItem.src);
          const extension = mediaItem.src.split(".").pop()?.toLowerCase()
          const sourceType = extension === "webm"
            ? "video/webm"
            : extension === "ogg"
              ? "video/ogg"
              : extension === "mov"
                ? "video/quicktime"
                : "video/mp4"
          const poster = extension === "mp4"
            ? mediaItem.src.replace(/\.mp4$/i, ".poster.webp")
            : undefined

          return (
            <div
              key={i}
              className="relative flex-shrink-0 group h-50 md:h-75 lg:h-115"
              style={{
                width: 'auto',
                margin: 0,
                padding: 0,
                backfaceVisibility: 'hidden',
                willChange: 'transform',
              }}
            >
              {isVideo ? (
                <>
                  <video
                    className="marquee-item h-full w-auto block"
                    muted
                    autoPlay={false}
                    // loop
                    playsInline
                    preload={"metadata"}
                    poster={poster}
                    onLoadedMetadata={handleVideoMetadata}
                    aria-label={mediaItem.title || mediaItem.description || 'Project video'}
                  >
                    <source src={mediaItem.src} type={sourceType} />
                  </video>
                </>
              ) : (
                <img
                  src={mediaItem.src}
                  alt={mediaItem.title || mediaItem.description || 'Project media'}
                  className="marquee-item h-full w-auto block"
                  loading="lazy"
                />
              )}

            {/* Dont delete or uncomment below */}
            {/* Lightbox button - shows on hover */}
            {/* <InfoIcon
            onClick={(e) => { e.stopPropagation(); onMediaClick?.(i); }}
            size={32}
            className="
              absolute top-2 right-2 p-1 rounded
              opacity-100 lg:opacity-0 lg:group-hover:opacity-100
              transition-opacity cursor-pointer
              text-white mix-blend-difference
              hidden lg:flex
            "
            /> */}
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="absolute py-2 bottom-0 right-3 flex h-fit justify-end items-end">

   
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggle();
          }}
          className="p-1.5 text-grey-500 hover:text-grey-900 transition-colors cursor-pointer"
          aria-label={isPaused ? 'Play' : 'Pause'}
        >
          {isPaused ? <PlayIcon  className="w-6 md:w-7" />  : <PauseIcon className="w-6 md:w-7" />}
        </button>

          {/* Dont delete or uncomment below */}
          {/* <button
          onClick={(e) => {
            e.stopPropagation();
            onMediaClick?.(0);
          }}
          className="p-1.5 text-grey-500 hover:text-grey-900 transition-colors cursor-pointer"
          aria-label="View gallery"
        >
          <CornersOutIcon className="w-6 md:w-7"/> 
        </button> */}


   
      </div>
    </div>
  );
}
