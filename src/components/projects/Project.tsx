import { useState, useRef, useEffect, lazy, Suspense } from "react";
import { useGSAP } from "@gsap/react";
import { useControls, folder } from "leva";
import { Marquee } from "./Marquee.js";
import { CloseButton } from "../ui/Button.js";
import type { ProjectData } from "../../App.js";
import { useAccordion, type AnimationControls } from "../../hooks/useAnimations.js";
import gsap from "gsap";
import data from "../../data/data.json" with { type: "json" };

const Gallery = lazy(() => import("./Gallery.js").then(module => ({ default: module.Gallery })));

gsap.registerPlugin(useGSAP);

export function Projects() {
  return (
    <div className="overflow-x-hidden h-fit flex flex-col gap-3">
      {[...Array(data.length)].map((v, i) => (
        <Project key={i} {...data[i]} />
      ))}
    </div>
  );
}

export function Project(props: ProjectData) {
  const container = useRef<HTMLDivElement>(null);
  const { contextSafe } = useGSAP({ scope: container });

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isHovering, setIsHovering] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const controls = useControls("Project", {
    mobileGap: { value: 2, min: 0, max: 80, step: 4, label: "Mobile Gap (px)" },
    desktopGap: { value: 40, min: 0, max: 80, step: 4, label: "Desktop Gap (px)" },
    contentGap: { value: 40, min: 0, max: 80, step: 4, label: "Content Gap (px)" },
  }, {collapsed: false});
  
  const { toggle, isExpanded } = useAccordion(contextSafe, container);

  return (
    <>
      <div
        ref={container}
        className="project flex flex-col gap-3"
      >
        <div
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={() => toggle()}
          className="preview cursor-pointer hover:cursor-pointer relative flex justify-between w-full h-75 md:h-125 lg:h-50 overflow-hidden"
          style={{ gap: isMobile ? `${controls.mobileGap}px` : `${controls.desktopGap}px` }}
        >

          <DateIndex {...props} />
          <TitleDescription {...props} />
          <Thumbnail {...props} />
          <CloseButton
            onClick={toggle}
            isHovering={isHovering}
            className="absolute right-0 top-0 p-3 opacity-0 z-10 pointer-events-none"
          />

        </div>

        <Content
          {...props}
          contentGap={controls.contentGap}
          onMediaClick={(index) => {
            setGalleryIndex(index);
            setGalleryOpen(true);
          }}
        />
        <hr className="border-gray-500 -mx-[10px] md:-mx-[40px] xl:mx-0 w-[calc(100%+20px)] md:w-[calc(100%+80px)] xl:w-full" />
      </div>

      {galleryOpen && (
        <Suspense fallback={null}>
          <Gallery
            media={props.media ?? []}
            initialIndex={galleryIndex}
            onClose={() => setGalleryOpen(false)}
          />
        </Suspense>
      )}
    </>
  );
}

export function DateIndex(props: ProjectData) {
  return (
    <div className="date-index flex w-">
      <div
        //   ref={dateIndex}
        className="flex flex-col min-h-full h-full w-20 pr-5 justify-between items-stretch border-gray-200 border-l"
      >
        <p>{props.year}</p>
        <p>[{props.id}]</p>
      </div>
      <div className="border-r-1 w-1 h-full border-gray-500"></div>
    </div>
  );
}

export function TitleDescription(props: ProjectData) {
  return (
    <div className={`title-description hidden w-40 lg:flex flex-col p-0`}>
      <p className="h-fit font-bold truncate">{props.name} </p>
      <p className="h-fit truncate">{props.category}</p>
    </div>
  );
}

export function Thumbnail(props: ProjectData) {
  const thumbnail = useRef(null);

  return (

    <div className="w-full flex flex-col gap-4 justify-between lg:w-100 px-4">

    {/* Mobile title overlay - positioned relative to preview container */}
    <div className="mobile-title w-full justify-between flex flex-col lg:hidden p-0 bottom-0 left-0 right-0 text-white pointer-events-none max-w-full" style={{ mixBlendMode: 'difference' }}>
      <p className="h-fit font-bold truncate max-w-full pr-4">{props.name}</p>
      <p className="h-fit truncate max-w-full pr-4">{props.category}</p>
    </div>

    <div className="thumbnail flex items-end justify-end min-w-full h-full lg:min-w-40 relative overflow-hidden">

      {/* Thumnail */}
      <img
        ref={thumbnail}
        className="thumbnail h-full w-full object-cover"
        style={{ objectPosition: props.thumbnailPosition ?? 'top' }}
        src={props.thumbnail}
        alt={props.name ?? 'Project thumbnail'}
        loading="lazy"
      />
    </div>

    </div>
  );
}

interface ContentProps extends ProjectData {
  onMediaClick?: (index: number) => void;
  contentGap?: number;
}

export function Content(props: ContentProps) {
  const [viewMore, setViewMore] = useState<boolean>(false);

  const maxLength = 100;
  const description = props.description ?? "";
  const isLong = description.length > maxLength;
  const abbreviated = description.slice(0, maxLength);

  return (
    <div
      className="content h-0 left-200 flex flex-col top-10 overflow-hidden gap-5 lg:gap-10"
    >
      <Marquee
        media={props.media ?? []}
        {...(props.onMediaClick && { onMediaClick: props.onMediaClick })}
      />
      <div className="flex flex-col gap-3">
        <p>
          {viewMore || !isLong ? (
            description
          ) : (
            <>
              {abbreviated}...{" "}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setViewMore(true);
                }}
                className="underline cursor-pointer"
              >
                view more
              </span>
            </>
          )}
        </p>

        {props.disclaimer && (
          <p className="text-gray-400 italic text-sm">
            {props.disclaimer}
          </p>
        )}

        {props.links && props.links.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {props.links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="underline hover:text-gray-400 transition-colors"
              >
                {link.label} →
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

