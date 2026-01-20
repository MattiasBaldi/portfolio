import type { ContextSafeFunc } from "@gsap/react";
import { useControls, folder } from "leva";
import { useEffect, useRef, useState } from "react";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import gsap from "gsap";
import { getMedia } from "../utils/media";
gsap.registerPlugin(ScrollToPlugin);

const EASE_OPTIONS = [
  "none",
  "power1.in",
  "power1.out",
  "power1.inOut",
  "power2.in",
  "power2.out",
  "power2.inOut",
  "power3.in",
  "power3.out",
  "power3.inOut",
  "power4.in",
  "power4.out",
  "power4.inOut",
  "back.in",
  "back.out",
  "back.inOut",
  "elastic.in",
  "elastic.out",
  "elastic.inOut",
  "bounce.in",
  "bounce.out",
  "bounce.inOut",
  "circ.in",
  "circ.out",
  "circ.inOut",
  "expo.in",
  "expo.out",
  "expo.inOut",
  "sine.in",
  "sine.out",
  "sine.inOut",
];

// Helper: Calculate title offset to align with date-index
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

// Helper: Scroll to element using GSAP ScrollToPlugin
function scrollToElement(target: HTMLElement, offsetY = 0) {
  const y = target.getBoundingClientRect().top + window.scrollY + offsetY;

  gsap.to(document.documentElement, {
    scrollTop: y,
    duration: 0.8,
    ease: "power2.out",
  });
}

// @claude dont touch this
// Helper: Scroll content into view using native scrollIntoView
function scrollIntoView(container: HTMLElement) {
  container.scrollIntoView({
    behavior: "smooth",
    block: "start",
    inline: "start",
  });
}

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
export function useAccordion(contextSafe: ContextSafeFunc, containerRef: React.RefObject<HTMLElement | null>) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

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


  const toggle = contextSafe(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const isMobile = getMedia("mobile") || getMedia("touch");
    const titleOffset = getTitleOffset(container);
    const mobileTitleOffset = isMobile ? getMobileTitleOffset(container) : undefined;

    console.log("Toggle clicked", { isExpanded, titleOffset, mobileTitleOffset, isMobile });

    // Animation
    if (!timelineRef.current) {
      console.log("Creating new timeline");
      const tl = gsap.timeline();

      // Common animations
      tl
        .to(".date-index", {  x: -100, opacity: controls.dateOpacity, duration: controls.dateSpeed, ease: controls.dateEase }, "<")      // prettier-ignore
        .to(".title-description", { x: titleOffset ?? controls.titleX, duration: controls.titleSpeed, ease: controls.titleEase }, "<")    // prettier-ignore
        .to(".thumbnail img", { y: controls.thumbnailY, opacity: controls.thumbnailOpacity, duration: controls.thumbnailSpeed, ease: controls.thumbnailEase },"<")      // prettier-ignore
        .to(".preview", { height: controls.previewHeight, duration: controls.previewSpeed, ease: controls.previewEase }, "<") // prettier-ignore
        .to(".content", { height: "auto", duration: controls.contentSpeed, ease: controls.contentEase}, "<"); // prettier-ignore

      // Conditional mobile animation
      if (isMobile) {
        console.log("Applying mobile offsets:", mobileTitleOffset);
        tl.to(".mobile-title", { x: mobileTitleOffset?.x ?? 0, duration: controls.mobileTitleSpeed, ease: controls.mobileTitleEase }, "<") // prettier-ignore
        .to(".preview", { height: controls.previewHeight * .5, duration: controls.previewSpeed, ease: controls.previewEase }, "<") // prettier-ignore
      }

      // Final animations
      tl.to(".close-button", { opacity: 0.5, pointerEvents: "auto", duration: 0.3, ease: "power2.out" }); // prettier-ignore

      timelineRef.current = tl;
    }
    else {
      console.log("Updating existing timeline");
      // Update offsets if timeline already exists
      const children = timelineRef.current.getChildren();
      if (children[1] && titleOffset !== undefined) {
        console.log("Updating title x offset to:", titleOffset);
        children[1].vars.x = titleOffset;
      }
      if (children[5] && mobileTitleOffset) {
        console.log("Updating mobile title x offset to:", mobileTitleOffset.x);
        children[5].vars.x = mobileTitleOffset.x;
      }
    }

    // toggle forward/back
    console.log("Reversing timeline, isExpanded =", isExpanded);
    isExpanded ? timelineRef.current.reversed(isExpanded).duration(0.75) : timelineRef.current.reversed(isExpanded)
    setIsExpanded(!isExpanded);
  });

  // Reset timeline on resize to force recalculation of offsets
  useEffect(() => {
    const handleResize = () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
        setIsExpanded(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { toggle, isExpanded };
}
