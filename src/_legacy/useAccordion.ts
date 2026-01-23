import { useGSAP, type ContextSafeFunc } from "@gsap/react";
import { useControls, folder } from "leva";
import { useCallback, useRef, useState } from "react";
import gsap from "gsap";
import { useMedia } from "@hooks/useMedia";
import { EASE_OPTIONS } from "../utils/gsap/ease";
import { useResize } from "@/hooks/useResize";
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

  const mQ = {
  isMobile: "(max-width: 763px)",
  isTablet: "(min-width: 764px) and (max-width: 1023px)",
  isDesktop: "(min-width: 1024px)"
  }


// Best practices for legacy

export function useAccordionMatchMedia(containerRef: React.RefObject<HTMLElement | null>) {
  const [isExpanded, setIsExpanded] = useState(false)
  const anim = useAccordionControls()

  const {context, contextSafe} = useGSAP(() => {
    if (!containerRef.current) return
 
    const mm = gsap.matchMedia()
    const container = containerRef.current; 

    mm.add({
      isMobile: "(max-width: 763px)",
      isTablet: "(min-width: 764px) and (max-width: 1023px)",
      isDesktop: "(min-width: 1024px)"
    }, (context) => {

      const { isMobile, isTablet, isDesktop } = (context.conditions as Record<string, boolean>); //prettier-ignore

      const titleHeight = getVisibleHeight(container, ".title-description")
      const mobileTitleHeight = getVisibleHeight(container, ".mobile-title")
      const previewHeight = (isDesktop ? titleHeight : mobileTitleHeight) ?? anim.previewHeight 
      
      const tl = gsap.timeline().reversed(isExpanded)

      // general specifications
      tl
        .to((".date-index"), {  x: -100, opacity: anim.dateOpacity, duration: anim.dateSpeed, ease: anim.dateEase }, "<")      // prettier-ignore
        .to((".thumbnail img"), { y: anim.thumbnailY, opacity: anim.thumbnailOpacity, duration: anim.thumbnailSpeed, ease: anim.thumbnailEase },"<")      // prettier-ignore
        .to((".content"), { height: "auto", duration: anim.contentSpeed, ease: anim.contentEase}, "<") // prettier-ignore
        .to((".close-button"), { opacity: 0.5, pointerEvents: "auto", duration: 0.3, ease: "power2.out" }) // prettier-ignore
        .to((".preview"), { height: previewHeight, duration: anim.previewSpeed, ease: anim.previewEase }, "<") // prettier-ignore
        
        // responsive specific specifications
        if (isDesktop)            tl.to((".title-description"), { x: getTitleOffset(container) ?? anim.titleX, duration: anim.titleSpeed, ease: anim.titleEase }, "<")    // prettier-ignore
        if (isMobile || isTablet) tl.to((".mobile-title"), { x: getMobileTitleOffset(container)?.x ?? 0, duration: anim.mobileTitleSpeed, ease: anim.mobileTitleEase }, "<") // prettier-ignore
    
        // key cleanup
        return () => tl.kill()
    })

      return () => mm.kill()
  }, { scope: containerRef, dependencies: [isExpanded, anim] })

  return { toggle: () => setIsExpanded((prev) => !prev), isExpanded }
}

export function useAccordionMatchMediaFixed(containerRef: React.RefObject<HTMLElement | null>) {
  const [isExpanded, setIsExpanded] = useState(false)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const anim = useAccordionControls()

  const { contextSafe } = useGSAP(() => {
    if (!containerRef.current) return

    const mm = gsap.matchMedia()
    const container = containerRef.current;

    mm.add({
      isMobile: "(max-width: 763px)",
      isTablet: "(min-width: 764px) and (max-width: 1023px)",
      isDesktop: "(min-width: 1024px)"
    }, (context) => {

      const { isMobile, isTablet, isDesktop } = (context.conditions as Record<string, boolean>); //prettier-ignore

      const titleHeight = getVisibleHeight(container, ".title-description")
      const mobileTitleHeight = getVisibleHeight(container, ".mobile-title")
      const previewHeight = (isDesktop ? titleHeight : mobileTitleHeight) ?? anim.previewHeight

      const tl = gsap.timeline()

      // general specifications
      tl
        .to(".date-index", {  x: -100, opacity: anim.dateOpacity, duration: anim.dateSpeed, ease: anim.dateEase }, "<")      // prettier-ignore
        .to(".thumbnail img", { y: anim.thumbnailY, opacity: anim.thumbnailOpacity, duration: anim.thumbnailSpeed, ease: anim.thumbnailEase },"<")      // prettier-ignore
        .to(".content", { height: "auto", duration: anim.contentSpeed, ease: anim.contentEase}, "<") // prettier-ignore
        .to(".close-button", { opacity: 0.5, pointerEvents: "auto", duration: 0.3, ease: "power2.out" }) // prettier-ignore
        .to(".preview", { height: previewHeight, duration: anim.previewSpeed, ease: anim.previewEase }, "<") // prettier-ignore

        // responsive specific specifications
        if (isDesktop)            tl.to(".title-description", { x: getTitleOffset(container) ?? anim.titleX, duration: anim.titleSpeed, ease: anim.titleEase }, "<")    // prettier-ignore
        if (isMobile || isTablet) tl.to(".mobile-title", { x: getMobileTitleOffset(container)?.x ?? 0, duration: anim.mobileTitleSpeed, ease: anim.mobileTitleEase }, "<") // prettier-ignore

        // Preserve animation state when matchMedia recreates (e.g., on resize across breakpoint)
        if (timelineRef.current) {
          tl.progress(timelineRef.current.progress()).reversed(timelineRef.current.reversed())
        }

        timelineRef.current = tl

        // key cleanup
        return () => tl.revert()
    })

      return () => mm.revert()
  }, { scope: containerRef }) // ✅ No isExpanded dependency - matchMedia only recreates on breakpoint changes

  const toggle = contextSafe(() => {
    if (!timelineRef.current) return

    setIsExpanded(prev => {
      timelineRef.current?.reversed(prev).duration(0.75)
      return !prev
    })
  })

  return { toggle, isExpanded }
}
