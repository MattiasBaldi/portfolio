import { useState, useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { useControls, folder } from "leva";
import { Marquee } from "./Marquee.js";
import type { ProjectData } from "../../App.js";
import { useToggle, type AnimationControls } from "../../hooks/useAnimations.js";
import gsap from "gsap";
import data from "../../data/data.json" with { type: "json" };

gsap.registerPlugin(useGSAP);

export function Projects() {
  return (
    <div className=" h-fit flex flex-col gap-3">
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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const controls = useControls("Project Layout", {
    mobileGap: { value: 2, min: 0, max: 80, step: 4, label: "Mobile Gap (px)" },
    desktopGap: { value: 40, min: 0, max: 80, step: 4, label: "Desktop Gap (px)" },
  });

  const animationControls = useControls(
    "Project Animations",
    {
    "Date Index": folder(
      {
        dateSpeed: { value: 1, min: 0, max: 10, step: 0.01, label: "Speed" },
        dateEase: { value: "power2.inOut", options: ["power1.inOut", "power2.inOut", "power3.inOut"], label: "Ease" },
        dateY: { value: 100, min: -500, max: 500, step: 1, label: "Y Offset" },
        dateOpacity: { value: 0, min: 0, max: 1, step: 0.01, label: "Opacity" },
      },
      { collapsed: true }
    ),
    "Title Description": folder(
      {
        titleSpeed: { value: 1, min: 0, max: 10, step: 0.01, label: "Speed" },
        titleEase: { value: "power2.inOut", options: ["power1.inOut", "power2.inOut", "power3.inOut"], label: "Ease" },
        titleX: { value: -600, min: -1000, max: 1000, step: 1, label: "X Offset" },
      },
      { collapsed: true }
    ),
    Thumbnail: folder(
      {
        thumbnailSpeed: { value: 1, min: 0, max: 10, step: 0.01, label: "Speed" },
        thumbnailEase: { value: "power2.inOut", options: ["power1.inOut", "power2.inOut", "power3.inOut"], label: "Ease" },
        thumbnailY: { value: 100, min: -500, max: 500, step: 1, label: "Y Offset" },
        thumbnailOpacity: { value: 0, min: 0, max: 1, step: 0.01, label: "Opacity" },
      },
      { collapsed: true }
    ),
    Preview: folder(
      {
        previewSpeed: { value: 1, min: 0, max: 10, step: 0.01, label: "Speed" },
        previewEase: { value: "power2.inOut", options: ["power1.inOut", "power2.inOut", "power3.inOut"], label: "Ease" },
        previewHeight: { value: 100, min: 0, max: 1000, step: 0.01, label: "Height" },
      },
      { collapsed: true }
    ),
    Content: folder(
      {
        contentSpeed: { value: 1, min: 0, max: 10, step: 0.01, label: "Speed" },
        contentEase: { value: "power2.inOut", options: ["power1.inOut", "power2.inOut", "power3.inOut"], label: "Ease" },
        contentHeight: { value: 400, min: 0, max: 1000, step: 0.01, label: "Height" },
      },
      { collapsed: true }
    ),
    },
    { collapsed: true }
  ) as AnimationControls;

  const { toggle, close, isExpanded } = useToggle(contextSafe, container, animationControls);

  return (
    <>
      <div
  
        ref={container}
        className="project container flex flex-col gap-3"
      >
        <div
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={() => toggle()}
          className="preview cursor-pointer hover:cursor-pointer relative flex justify-between w-full h-40 overflow-hidden"
          style={{ gap: isMobile ? `${controls.mobileGap}px` : `${controls.desktopGap}px` }}
        >

          <DateIndex {...props} />
          <TitleDescription {...props} />
          <Thumbnail {...props} />
          <CloseButton onClick={close} isHovering={isHovering} />

        </div>

        <Content {...props} />
        <hr className="border-gray-500 -mx-[10px] md:-mx-[40px] xl:mx-0 w-[calc(100%+20px)] md:w-[calc(100%+80px)] xl:w-full" />
      </div>
    </>
  );
}

export function DateIndex(props: ProjectData) {
  return (
    <div className="date-index  flex w-">
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
      <p className="h-fit font-bold truncate">{props.name}</p>
      <p className="h-fit truncate">{props.category}</p>
    </div>
  );
}

export function Thumbnail(props: ProjectData) {
  const thumbnail = useRef(null);
  // use animation here

  return (
    <div className="thumbnail min-w-full h-full lg:min-w-40 relative">
      {/* Thumnail */}
      <img
        ref={thumbnail}
        className="thumbnail w-full lg:w-100"
        src={props.thumbnail}
        loading="lazy"
      />


      {/* Title and category - separate from thumbnail animation */}
      <div className="mobile-title lg:hidden flex flex-col absolute p-3 bottom-0 left-0 text-grey-0">
        <p className="h-fit font-bold truncate">{props.name}</p>
        <p className="h-fit truncate">{props.category}</p>
      </div>
    </div>
  );
}

export function Content(props: ProjectData) {
  const [viewMore, setViewMore] = useState<boolean>(false);

  const maxLength = 100;
  const description = props.description ?? "";
  const isLong = description.length > maxLength;
  const abbreviated = description.slice(0, maxLength);

  return (
    <div className="content h-0 left-200 flex flex-col top-10 gap-10 overflow-hidden">
      <Marquee media={props.media ?? []} />
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
    </div>
  );
}

// Import

// ---------- Reusable Close Button ----------
interface CloseButtonProps {
  onClick: () => void;
  isHovering?: boolean;
}

export function CloseButton({ onClick, isHovering }: CloseButtonProps) {
  return (
    <button
      className={`close-button absolute right-0 top-0 p-3 hover:cursor-pointer opacity-0 z-10 pointer-events-none ${isHovering ? "underline" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      Close
    </button>
  );
}
