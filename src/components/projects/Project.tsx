import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useControls } from "leva";
import { Content } from "./Content.js";

import type { ProjectData } from "../../App.js";
import { useToggle } from "../../hooks/useAnimations.js";

gsap.registerPlugin(useGSAP);

export default function Project(props: ProjectData) {
  const container = useRef<HTMLDivElement>(null);
  const { contextSafe } = useGSAP({ scope: container });
  const { toggle, close } = useToggle(contextSafe, container);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const controls = useControls("Project Layout", {
    mobileGap: { value: 12, min: 0, max: 80, step: 4, label: "Mobile Gap (px)" },
    desktopGap: { value: 40, min: 0, max: 80, step: 4, label: "Desktop Gap (px)" },
  });

  return (
    <>
      <div
        onClick={() => toggle()}
        ref={container}
        className="project container flex flex-col gap-3"
      >
        <div
          className="preview cursor-pointer relative flex justify-between w-full h-40 overflow-hidden"
          style={{ gap: isMobile ? `${controls.mobileGap}px` : `${controls.desktopGap}px` }}
        >
          <DateIndex {...props} />
          <TitleDescription {...props} />
          <Thumbnail {...props} />
          <CloseButton onClick={close} />
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

// ---------- Reusable Close Button ----------
interface CloseButtonProps {
  onClick: () => void;
}

export function CloseButton({ onClick }: CloseButtonProps) {
  return (
    <button
      className="close-button absolute right-0 top-0 p-3 hover:cursor-pointer hover:underline opacity-0 z-10 pointer-events-none"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      Close
    </button>
  );
}

export function Thumbnail(props: ProjectData) {
  const thumbnail = useRef(null);

  return (
    <div className="thumbnail min-w-full h-full lg:min-w-40 relative">
      {/* Thumnail */}
      <img
        ref={thumbnail}
        className="thumbnail w-full lg:w-100"
        src={props.thumbnail}
      />

      {/* Title and category - separate from thumbnail animation */}
      <div className="mobile-title lg:hidden flex flex-col absolute p-3 bottom-0 left-0 text-grey-0">
        <p className="h-fit font-bold truncate">{props.name}</p>
        <p className="h-fit truncate">{props.category}</p>
      </div>
    </div>
  );
}
