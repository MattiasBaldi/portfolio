import type { ContextSafeFunc } from "@gsap/react";
import { useControls, folder } from "leva";
import { useRef, useState } from "react";
import gsap from "gsap";

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

export function useToggle(contextSafe: ContextSafeFunc, containerRef: React.RefObject<HTMLElement>, animationProps?: AnimationControls) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const levaControls = useControls(
    "Animation",
    {
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
    },
    { collapsed: true }
  );

  // Merge animation props with leva controls (props take precedence)
  const controls = {
    ...levaControls,
    ...animationProps,
  } as typeof levaControls;

  const toggle = contextSafe(() => {
    console.log('🎯 Toggle called');
    console.log('  isExpanded:', isExpanded);
    console.log('  scrollToView:', controls.scrollToView);
    console.log('  containerRef.current:', containerRef.current);

    // Get elements
    const dateIndex = document.querySelector(".date-index") as HTMLElement;
    const titleDescription = document.querySelector(".title-description") as HTMLElement;

    // Calculate dynamic offset based on actual element positions
    let titleOffset = controls.titleX; // fallback to control value
    if (dateIndex && titleDescription) {
      const dateRect = dateIndex.getBoundingClientRect();
      const titleRect = titleDescription.getBoundingClientRect();
      titleOffset = dateRect.left - titleRect.left;
    }

    // Create timeline once
    if (!timelineRef.current) {
      const tl = gsap.timeline();
      tl
        .to(".date-index", {  x: -100, opacity: controls.dateOpacity, duration: controls.dateSpeed, ease: controls.dateEase }, "<")      // prettier-ignore
        .to(".title-description", { x: titleOffset, duration: controls.titleSpeed, ease: controls.titleEase }, "<")    // prettier-ignore
        .to(".thumbnail img", { y: controls.thumbnailY, opacity: controls.thumbnailOpacity, duration: controls.thumbnailSpeed, ease: controls.thumbnailEase },"<")      // prettier-ignore
        .to(".mobile-title", { y: -115, color: "#171717", duration: controls.titleSpeed, ease: controls.titleEase }, "<") // move to top-left within container
        .to(".preview", { height: controls.previewHeight, duration: controls.previewSpeed, ease: controls.previewEase }, "<") // prettier-ignore
        .to(".content", { height: "100vh", duration: controls.contentSpeed, ease: controls.contentEase}, "<") // prettier-ignore
        .to(".close-button", { opacity: 0.5, pointerEvents: "auto", duration: 0.3, ease: "power2.out" }) // prettier-ignore

      timelineRef.current = tl;
    } else {
      // Update the x value if timeline already exists
      const children = timelineRef.current.getChildren();
      if (children[1]) {
        children[1].vars.x = titleOffset;
      }
    }

    // Scroll to view when expanding
    if (!isExpanded && controls.scrollToView && containerRef.current) {
      containerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }

    // toggle forward/back
    timelineRef.current.reversed(isExpanded);
    setIsExpanded(!isExpanded);
  });

  const close = contextSafe(() => {
    if (isExpanded && timelineRef.current) {
      timelineRef.current.reversed(true);
      setIsExpanded(false);
    }
  });

  return { toggle, close, isExpanded };
}
