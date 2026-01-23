import { useGSAP, type ContextSafeFunc } from "@gsap/react";
import { useControls, folder } from "leva";
import { useCallback, useRef, useState } from "react";
import gsap from "gsap";
import { useMedia } from "./useMedia";
import { EASE_OPTIONS } from "../utils/gsap/ease";
import { useResize } from "./useResize";
import { getMobileTitleOffset, getTitleOffset, getVisibleHeight } from "@/utils/accordion";

function useAccordionControls() {
  return useControls(
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
  )
}

export function useAccordion(containerRef: React.RefObject<HTMLElement | null>) {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [titleOffset, setTitleOffset] = useState<number | undefined>(undefined)
  const [mobileTitleOffset, setMobileTitleOffset] = useState<{ x: number; y: number } | undefined>(undefined)
  const { isMobile, isTablet } = useMedia()
  const resizeStrategy: "rebuild" = "rebuild"
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const anim = useAccordionControls()
  const { contextSafe } = useGSAP(() => {}, { scope: containerRef });

  const buildTimeline = useCallback(() => {
    if (!containerRef.current) return null
    const q = gsap.utils.selector(containerRef)
    const isMobileView = isMobile || isTablet
    const nextTitleOffset = getTitleOffset(containerRef.current)
    const nextMobileTitleOffset = isMobileView ? getMobileTitleOffset(containerRef.current) : undefined
    const mobileTitle = containerRef.current.querySelector(".mobile-title")
    const title = containerRef.current.querySelector(".title-description")
    const titleHeight = getVisibleHeight(containerRef.current, ".title-description")
      const mobileTitleHeight = getVisibleHeight(containerRef.current, ".mobile-title")
    const previewHeight = (isMobileView ? mobileTitleHeight : titleHeight) ?? titleHeight ?? mobileTitleHeight ?? anim.previewHeight
    const tl = gsap.timeline()

    tl
      .to(q(".date-index"), {  x: -100, opacity: anim.dateOpacity, duration: anim.dateSpeed, ease: anim.dateEase }, "<")      // prettier-ignore
      .to(q(".title-description"), { x: nextTitleOffset ?? anim.titleX, duration: anim.titleSpeed, ease: anim.titleEase }, "<")    // prettier-ignore
      .to(q(".thumbnail img"), { y: anim.thumbnailY, opacity: anim.thumbnailOpacity, duration: anim.thumbnailSpeed, ease: anim.thumbnailEase },"<")      // prettier-ignore
      .to(q(".content"), { height: "auto", duration: anim.contentSpeed, ease: anim.contentEase}, "<") // prettier-ignore
      .to(q(".preview"), { height: previewHeight, duration: anim.previewSpeed, ease: anim.previewEase }, "<") // prettier-ignore
      .to(q(".mobile-title"), { x: nextMobileTitleOffset?.x ?? 0, duration: anim.mobileTitleSpeed, ease: anim.mobileTitleEase }, "<") // prettier-ignore
      .to(q(".close-button"), { opacity: 0.5, pointerEvents: "auto", duration: 0.3, ease: "power2.out" }); // prettier-ignore
  
    return tl
  }, [anim, containerRef, isMobile, isTablet])

  const toggle = contextSafe(() => {
    if (!containerRef.current) return;
    
    // Animation
    if (!timelineRef.current) {
      timelineRef.current = buildTimeline()
    }
    
    // Dont recreate it otherwise
    else {
      const children = timelineRef.current.getChildren();       // Update offsets if timeline already exists
      const titleTween = children[1] as gsap.core.Tween | undefined
      if (titleTween && typeof titleOffset === "number") {
        titleTween.vars.x = titleOffset;
      }
      const mobileTitleTween = children[5] as gsap.core.Tween | undefined
      if (mobileTitleTween && mobileTitleOffset) {
        mobileTitleTween.vars.x = mobileTitleOffset.x;
      }
    }

    // toggle forward/back
    setIsExpanded(prev => {
      timelineRef.current?.reversed(prev).duration(0.75)
      return !prev
    })
  });

  // on resize with debouncing
  useResize(() => {
    if (!timelineRef.current || !containerRef.current) return
    if (resizeStrategy === "rebuild") {
      const progress = timelineRef.current.progress()
      const reversed = timelineRef.current.reversed()
      timelineRef.current.revert()
      timelineRef.current = buildTimeline()
      timelineRef.current?.progress(progress).reversed(reversed)
      return
    }
  }, {delay: 20})

  return { toggle, isExpanded };
}

