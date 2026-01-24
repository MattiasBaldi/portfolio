import { useState, useRef, useEffect, lazy, Suspense } from "react";
import { useGSAP } from "@gsap/react";
import { useControls, folder } from "leva";
import { Marquee } from "./Marquee.js";
import { CloseButton } from "../ui/Button.js";
import type { ProjectData } from "../../App.js";
import { useAccordion } from "../../hooks/useAccordion.js";
import data from "../../data/data.json" with { type: "json" };
import { cfImage, cfMedia, isImage, isVideo } from "@/utils/media.js";

const Gallery = lazy(() => import("./Gallery.js").then(module => ({ default: module.Gallery })));

export function Projects() {
  return (
    <div className="overflow-x-hidden h-fit flex flex-col gap-3">
      {data.map((project) => (
        <>
        <div key={project.id}>
          <Project {...project} />
        </div>
          <hr className="border-gray-500 mx-2.5 md:-mx-10 xl:mx-0 w-[calc(100%+20px)] md:w-[calc(100%+80px)] xl:w-full" />
          </>
      ))}
    </div>
  );
}

export function Project(props: ProjectData) {
  const container = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const controls = useControls("Project", {
    mobileGap: { value: 2, min: 0, max: 80, step: 4, label: "Mobile Gap (px)" },
    desktopGap: { value: 40, min: 0, max: 80, step: 4, label: "Desktop Gap (px)" },
    contentGap: { value: 40, min: 0, max: 80, step: 4, label: "Content Gap (px)" },
  }, {collapsed: true});

  
  const { toggle, isExpanded } = useAccordion(container);

  return (
    <>
      <div
        ref={container}
        className="project flex flex-col project-gap"
      >
        <div
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={() => toggle()}
          className="preview gap-5 lg:gap-20 cursor-pointer hover:cursor-pointer relative flex justify-between w-full h-75 md:h-125 lg:h-50 overflow-hidden"
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
          show={isExpanded}
          {...props}
          onMediaClick={(index) => {
            setGalleryIndex(index);
            setGalleryOpen(true);
          }}
        />
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
    <div className={`title-description hidden w-40 h-fit lg:flex flex-col p-0`}>
      <p className="h-fit font-bold truncate">{props.name} </p>
      <p className="h-fit truncate">{props.category}</p>
    </div>
  );
}

export function Thumbnail(props: ProjectData) {
  return (

    <div className="w-full flex flex-col gap-4 justify-between lg:w-100 px-4">

    {/* Mobile title overlay - positioned relative to preview container */}
    <div className="mobile-title w-full justify-between flex flex-col lg:hidden p-0 bottom-0 left-0 right-0 text-white pointer-events-none max-w-full" style={{ mixBlendMode: 'difference' }}>
      <p className="h-fit font-bold truncate max-w-full pr-4">{props.name}</p>
      <p className="h-fit truncate max-w-full pr-4">{props.category}</p>
    </div>

    <ThumnailImage {...props} /> 
    </div>
  );
}

export function ThumnailImage(props: ProjectData) {
  const thumbnail = useRef(null)
  const isImg = !!isImage(props?.thumbnail ?? '')
  const isVid = !!isVideo(props?.thumbnail ?? '')

  if (!props.thumbnail || (!isImg && !isVid)) return <p>image error</p>

  const compressProps = {
    image: {
      format: 'auto',
      quality: 80
    },
    video: {
      mode: 'video',
      duration: 7,
      audio: false
    }
  }

  const widths = {
    sm: 480,
    md: 960,
    lg: 1440
  }

  const sizes = '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'

  const imgSrcSet = [
    `${cfImage(props.thumbnail, { ...compressProps.image, width: widths.sm })} ${widths.sm}w`,
    `${cfImage(props.thumbnail, { ...compressProps.image, width: widths.md })} ${widths.md}w`,
    `${cfImage(props.thumbnail, { ...compressProps.image, width: widths.lg })} ${widths.lg}w`
  ].join(', ')


  console.log(imgSrcSet)


  return (
    <div className="thumbnail flex items-end justify-end min-w-full h-full lg:min-w-40 relative overflow-hidden">
      {isImg && (
        <img
          ref={thumbnail}
          className="thumbnail h-full w-full object-cover"
          style={{ objectPosition: props.thumbnailPosition ?? 'top' }}
          sizes={sizes}
          srcSet={imgSrcSet}
          src={cfImage(props.thumbnail, { ...compressProps.image, width: widths.md })}
          alt={props.name ?? 'Project thumbnail'}
          loading="lazy"
        />
      )}
      {isVid && (
        <video
          controls={false}
          autoPlay
          muted
          loop
          className="thumbnail h-full w-full object-cover"
          style={{ objectPosition: props.thumbnailPosition ?? 'top' }}
          playsInline
          preload="metadata"
        >
          <source src={cfMedia(props.thumbnail, { ...compressProps.video, width: widths.sm })} type="video/mp4" />
          <source src={cfMedia(props.thumbnail, { ...compressProps.video, width: widths.md })} type="video/mp4" />
          <source src={cfMedia(props.thumbnail, { ...compressProps.video, width: widths.lg })} type="video/mp4" />
        </video>
      )}
    </div>
  )
}

interface ContentProps extends ProjectData {
  show: boolean; 
  active: boolean; 
  onMediaClick?: (index: number) => void;
}

export function Content(props: ContentProps) {
  const [viewMore, setViewMore] = useState<boolean>(false);

  const maxLength = window.innerWidth < 500 ? 100 : window.innerWidth < 1024 ? 150 : 250; 
  const description = props.description ?? "";
  const isLong = description.length > maxLength;
  const abbreviated = description.slice(0, maxLength);

  return (
    <div
    className={`content h-0 left-200 flex flex-col overflow-hidden`}
    >
      <Marquee
        media={props.media ?? []}
        active={props.active}
        show={props.show}
        {...(props.onMediaClick && { onMediaClick: props.onMediaClick })}
      />
      <div className="description flex flex-col gap-3">
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
