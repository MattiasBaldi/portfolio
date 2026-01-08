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

export function useToggle(contextSafe: ContextSafeFunc) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const controls = useControls("Animation", {
    "Date Index": folder({
      dateSpeed: { value: 1, min: 0, max: 10, step: 0.01, label: "Speed" },
      dateEase: { value: "power2.inOut", options: EASE_OPTIONS, label: "Ease" },
      dateY: { value: 100, min: -500, max: 500, step: 1, label: "Y Offset" },
      dateOpacity: { value: 0, min: 0, max: 1, step: 0.01, label: "Opacity" },
    }),

    "Title Description": folder({
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
    }),

    Thumbnail: folder({
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
    }),

    Preview: folder({
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
    }),

    Content: folder({
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
    }),
  });

  const toggle = contextSafe(() => {
    gsap.getProperty(".date-index");

    // Create timeline once
    if (!timelineRef.current) {
      const tl = gsap.timeline();
      tl
        .to(".date-index", {  x: -100, opacity: controls.dateOpacity, duration: controls.dateSpeed, ease: controls.dateEase }, "<")      // prettier-ignore
        .to(".title-description", { x: controls.titleX, paddingTop: 20, duration: controls.titleSpeed, ease: controls.titleEase }, "<")    // prettier-ignore
        .to(".thumbnail", { y: controls.thumbnailY, opacity: controls.thumbnailOpacity, duration: controls.thumbnailSpeed, ease: controls.thumbnailEase },"<")      // prettier-ignore
        .to(".preview", { height: controls.previewHeight, duration: controls.previewSpeed, ease: controls.previewEase }, "<") // prettier-ignore
        .to(".content", { height: "auto", duration: controls.contentSpeed, ease: controls.contentEase}, "<") // prettier-ignore

      timelineRef.current = tl;
    }

    // toggle forward/back
    timelineRef.current.reversed(isExpanded);
    setIsExpanded(!isExpanded);
  });

  return toggle;
}
