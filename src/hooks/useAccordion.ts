import { useGSAP, type ContextSafeFunc } from "@gsap/react";
import { useControls, folder } from "leva";
import { useCallback, useRef, useState } from "react";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import gsap from "gsap";
import { getMedia } from "../utils/media";
import { EASE_OPTIONS } from "../utils/gsap/ease";
import { useResize } from "./useResize";
gsap.registerPlugin(useGSAP);
gsap.registerPlugin(ScrollToPlugin);

export interface AnimationControls {
  scrollToView?: boolean;
  scrollOffset?: number;
  dateSpeed?: number;
  dateEase?: string;
  dateY?: number;
  dateOpacity?: number;
  titleSpeed?: number;
  titleEase?: string;
  titleX?: number;
  mobileTitleSpeed?: number;
  mobileTitleEase?: string;
  thumbnailSpeed?: number;
  thumbnailEase?: string;
  thumbnailY?: number;
  thumbnailOpacity?: number;
  previewSpeed?: number;
  previewEase?: string;
  previewHeight?: number;
  contentSpeed?: number;
  contentEase?: string;
  contentHeight?: number;
}

export function useAccordion(containerRef: React.RefObject<HTMLElement | null>) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [titleOffset, setTitleOffset] = useState(null)
  const [mobileTitleOffset, setMobileTitleOffset] = useState(null)
  const resizeStrategy: "rebuild" = "rebuild"

  const controls = useControls(
    "Project",
    {
      animation: folder({
      scrollToView: { value: true, label: "Scroll on Expand" },
      scrollOffset: { value: 0, min: -200, max: 200, step: 10, label: "Scroll Offset" },
      "Date Index": folder(
        {
          dateSpeed: { value: 1, min: 0, max: 10, step: 0.01, label: "Speed" },
          dateEase: { value: "power2.inOut", options: EASE_OPTIONS, label: "Ease" },
          dateY: { value: 100, min: -500, max: 500, step: 1, label: "Y Offset" },
          dateOpacity: { value: 0, min: 0, max: 1, step: 0.01, label: "Opacity" },
        },
        { collapsed: true }
      ),

      "Title Description": folder(
        {
          titleSpeed: { value: 1, min: 0, max: 10, step: 0.01, label: "Speed" },
          titleEase: {
            value: "power2.inOut",
            options: EASE_OPTIONS,
            label: "Ease",
          },
          titleX: {
            value: -600,
            min: -1000,
            max: 1000,
            step: 1,
            label: "X Offset",
          },
        },
        { collapsed: true }
      ),

      "Mobile Title": folder(
        {
          mobileTitleSpeed: { value: 1, min: 0, max: 10, step: 0.01, label: "Speed" },
          mobileTitleEase: {
            value: "power2.inOut",
            options: EASE_OPTIONS,
            label: "Ease",
          },
        },
        { collapsed: true }
      ),


      Thumbnail: folder(
        {
          thumbnailSpeed: { value: 1, min: 0, max: 10, step: 0.01, label: "Speed" },
          thumbnailEase: {
            value: "power2.inOut",
            options: EASE_OPTIONS,
            label: "Ease",
          },
          thumbnailY: {
            value: 100,
            min: -500,
            max: 500,
            step: 1,
            label: "Y Offset",
          },
          thumbnailOpacity: {
            value: 0,
            min: 0,
            max: 1,
            step: 0.01,
            label: "Opacity",
          },
        },
        { collapsed: true }
      ),

      Preview: folder(
        {
          previewSpeed: { value: 1, min: 0, max: 10, step: 0.01, label: "Speed" },
          previewEase: {
            value: "power2.inOut",
            options: EASE_OPTIONS,
            label: "Ease",
          },
          previewHeight: {
            value: 100,
            min: 0,
            max: 1000,
            step: 0.01,
            label: "Height",
          },
        },
        { collapsed: true }
      ),

      Content: folder(
        {
          contentSpeed: { value: 1, min: 0, max: 10, step: 0.01, label: "Speed" },
          contentEase: {
            value: "power2.inOut",
            options: EASE_OPTIONS,
            label: "Ease",
          },
          contentHeight: {
            value: 400,
            min: 0,
            max: 1000,
            step: 0.01,
            label: "Height",
          },
        },
        { collapsed: true }
      ),
    })
    }
  );
  const animation = (controls as { animation?: AnimationControls }).animation ?? controls

  const { contextSafe } = useGSAP({ scope: containerRef });

  const buildTimeline = useCallback(() => {
    if (!containerRef.current) return null
    const q = gsap.utils.selector(containerRef)
    const isMobile = getMedia("mobile") || getMedia("touch")
    const nextTitleOffset = getTitleOffset(containerRef.current)
    const nextMobileTitleOffset = isMobile ? getMobileTitleOffset(containerRef.current) : undefined
    const mobileTitle = containerRef.current.querySelector(".mobile-title")
    const title = containerRef.current.querySelector(".title-description")
    const tl = gsap.timeline()

    tl
      .to(q(".date-index"), {  x: -100, opacity: animation.dateOpacity, duration: animation.dateSpeed, ease: animation.dateEase }, "<")      // prettier-ignore
      .to(q(".title-description"), { x: nextTitleOffset ?? animation.titleX, duration: animation.titleSpeed, ease: animation.titleEase }, "<")    // prettier-ignore
      .to(q(".thumbnail img"), { y: animation.thumbnailY, opacity: animation.thumbnailOpacity, duration: animation.thumbnailSpeed, ease: animation.thumbnailEase },"<")      // prettier-ignore
      .to(q(".content"), { height: "auto", duration: animation.contentSpeed, ease: animation.contentEase}, "<") // prettier-ignore
      .to(q(".preview"), { height: isMobile ? (mobileTitle?.getBoundingClientRect().height ?? 0) : (title && window.getComputedStyle(title).display !== "none" ? (title.getBoundingClientRect().height || animation.previewHeight) : animation.previewHeight), duration: animation.previewSpeed, ease: animation.previewEase }, "<") // prettier-ignore
      .to(q(".mobile-title"), { x: nextMobileTitleOffset?.x ?? 0, duration: animation.mobileTitleSpeed, ease: animation.mobileTitleEase }, "<") // prettier-ignore
      .to(q(".close-button"), { opacity: 0.5, pointerEvents: "auto", duration: 0.3, ease: "power2.out" }); // prettier-ignore
  
    return tl
  }, [animation, containerRef, controls])

  const toggle = contextSafe(() => {
    if (!containerRef.current) return;
    
    // Animation
    if (!timelineRef.current) {
      timelineRef.current = buildTimeline()
    }
    
    // Dont recreate it otherwise
    else {
      const children = timelineRef.current.getChildren();       // Update offsets if timeline already exists
      if (children[1] && titleOffset !== undefined) {
        children[1].vars.x = titleOffset;
      }
      if (children[5] && mobileTitleOffset) {
        children[5].vars.x = mobileTitleOffset.x;
      }
    }

    // toggle forward/back
    setIsExpanded(prev => {
      timelineRef.current?.reversed(prev).duration(0.75)
      return !prev
    })
  });

  const handleResize = useCallback(() => {
    if (!timelineRef.current || !containerRef.current) return
    if (resizeStrategy === "rebuild") {
      const progress = timelineRef.current.progress()
      const reversed = timelineRef.current.reversed()
      timelineRef.current.revert()
      timelineRef.current = buildTimeline()
      timelineRef.current?.progress(progress).reversed(reversed)
      return
    }
  }, [buildTimeline, containerRef, resizeStrategy])

  useResize(containerRef, handleResize, {delay: 5})

  return { toggle, isExpanded };
}

function getTitleOffset(container: HTMLElement): number | undefined {
  const dateIndex = container.querySelector(".date-index");
  const titleDescription = container.querySelector(".title-description");
  if (!dateIndex || !titleDescription) return undefined;
  const dateRect = dateIndex.getBoundingClientRect();
  const titleRect = titleDescription.getBoundingClientRect();
  return dateRect.left - titleRect.left;
}

// Helper: Calculate mobile title offset to align with date-index
function getMobileTitleOffset(container: HTMLElement): { x: number; y: number } | undefined {
  const dateIndex = container.querySelector(".date-index");
  const mobileTitle = container.querySelector(".mobile-title");
  if (!dateIndex || !mobileTitle) return undefined;
  const dateRect = dateIndex.getBoundingClientRect();
  const mobileTitleRect = mobileTitle.getBoundingClientRect();
  return {
    x: dateRect.left - mobileTitleRect.left,
    y: -(mobileTitleRect.top - dateRect.top),
  };
}
