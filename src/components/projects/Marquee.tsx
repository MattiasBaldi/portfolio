import { memo, useRef, useState } from "react";
import { InfoIcon, PlayIcon, PauseIcon, GridFourIcon, CornersOutIcon } from '@phosphor-icons/react'
import type { MediaItem } from "../../App.js";
import { useMarquee } from "@/hooks/useMarquee.js";

export type MarqueeLoopProps = {
  media: MediaItem[];
  onMediaClick?: (index: number) => void;
  show?: boolean;
};

export function Marquee({ media, onMediaClick, show, active }: MarqueeLoopProps) {
   const wrapper = useRef(null);
   const { toggle, isPaused, refreshMarquee } = useMarquee(wrapper, { enabled: show ?? false })

  
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
        {media.map((mediaItem, i) => (
          <MarqueeItem key={`${mediaItem.src}-${i}`} mediaItem={mediaItem} refreshMarquee={refreshMarquee}/>
        ))}
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
   
      </div>
    </div>
  );
}

type MarqueeItemProps = {
  mediaItem: MediaItem;
  refreshMarquee: () => void; 
};

export const MarqueeItem = memo(({ mediaItem, refreshMarquee }: MarqueeItemProps) => {
  const [buffering, setBuffering] = useState(false)
  const [showPoster, setShowPoster] = useState(true)
  const isVideo = /\.(webm|mp4|mov|m4v|ogg)$/i.test(mediaItem.src);
  const extension = mediaItem.src.split(".").pop()?.toLowerCase()
  const sourceType = extension === "webm" ? "video/webm" : extension === "ogg" ? "video/ogg" : extension === "mov" ? "video/quicktime" : "video/mp4" //prettier-ignore
  const poster = isVideo ? mediaItem.src.replace(/\.[^/.]+$/, '.poster.webp') : undefined

  return (
    <div
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
            className="marquee-item  w-auto block h-50 md:h-75 lg:h-115"
            muted
            autoPlay={false}
            playsInline
            preload={"metadata"}
            aria-label={mediaItem.title || mediaItem.description || 'Project video'}
            onLoadStart={() => {
              setBuffering(true)
              setShowPoster(true)
            }}
            onWaiting={() => setBuffering(true)}
            onPlaying={() => {
              setBuffering(false)
              setShowPoster(false)
            }}
            onCanPlay={() => setBuffering(false)}
            onLoadedData={() => setBuffering(false)}
          >
            <source src={mediaItem.src} type={sourceType} />
          </video>
          {poster && (
            <img
              src={poster}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-200 pointer-events-none"
              style={{ opacity: showPoster ? 1 : 0 }}
            />
          )}
          {buffering && (
            <div className="absolute inset-0 flex items-center justify-center border-1-red p-5">
              <div className="h-8 w-8 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            </div>
          )}
        </>
      ) : (
        <img
          src={mediaItem.src}
          alt={mediaItem.title || mediaItem.description || 'Project media'}
          className="marquee-item w-auto block h-50 md:h-75 lg:h-115"
          onLoad={() => refreshMarquee()}
          loading="lazy"
        />
      )}
    </div>
  )
})
