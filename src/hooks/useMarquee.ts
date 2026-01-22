import { useGSAP } from "@gsap/react"
import { useCallback, useEffect, useRef, useState, type RefObject } from "react"
import { horizontalLoop } from "../utils/gsap/horizontalLoop"
import { useControls } from "leva"
import { checkReady, playVideosInBatches } from "../utils/marquee"

type UseMarqueeOptions = {
  enabled?: boolean
}

export function useMarquee(wrapper: RefObject<HTMLDivElement | null>, options: UseMarqueeOptions = {}) {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [ready, setReady] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const enabled = options.enabled ?? true
  const stopBatchRef = useRef<null | (() => void)>(null)

  const controls = useControls(
    "Marquee",
        {
          mobileHeight: { value: 250, min: 0, max: 500, label: "Mobile Height" },
          desktopHeight: { value: 500, min: 0, max: 1000, label: "Desktop Height" },
          speed: {
            value: 0.5,
            min: 0,
            max: 5,
            step: 0.1,
            transient: false, 
            label: "Speed",
            onChange: (v: number) => console.log("test", v),
          },
          resistance: { value: 10, min: 1, max: 50, step: 1, label: "Drag Resistance" },
          minVelocity: { value: 50, min: 0, max: 200, step: 10, label: "Min Velocity" },
          repeat: { value: 5, min: 0, max: 20, step: 1, label: "Repeat" },
          gap: { value: 0, min: -20, max: 20, step: 1, label: "Gap" },
          draggable: { value: true, label: "Draggable" },
          dragSnap: { value: true, label: "Drag Snap" },
        },
        { collapsed: true }, 
    [timelineRef] // your deps
  );
  
  useGSAP(() => 
    {
      if (!enabled) return
      const containers = wrapper.current ? (Array.from(wrapper.current.children) as HTMLDivElement[]) : []
      
      if (!containers.length || !containers[0]) {
        setReady(false)
        return
      }

      if (!ready) {
        checkReady(containers, () => setReady(true), { playVideos: false })
        return
      }

      const tl = horizontalLoop(containers, {
        repeat: controls.repeat,
        draggable: controls.draggable,
        dragSnap: controls.dragSnap,
        inertia: {
          resistance: controls.resistance,
          minVelocity: controls.minVelocity,
          allowX: true,
          allowY: false,
        },
        paused: false,
        speed: controls.speed,
        center: true,
        paddingRight: 0,
        snap: false, // Disable snap to prevent gaps at loop point
      });

      if (tl) timelineRef.current = tl;
    
      return () => tl?.kill()
      
    },
    { scope: wrapper, dependencies: [enabled, ready, controls] }
  ); 

  useEffect(() => {
    if (!enabled && timelineRef.current) {
      timelineRef.current.pause()
      setIsPaused(true)
    }
    if (!enabled && stopBatchRef.current) {
      stopBatchRef.current()
      stopBatchRef.current = null
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled || !ready || !wrapper.current) return
    const videos = Array.from(wrapper.current.querySelectorAll("video"))
    if (!videos.length) return
    stopBatchRef.current?.()
    stopBatchRef.current = playVideosInBatches(videos, { batchSize: 2, delay: 150 })
    return () => {
      stopBatchRef.current?.()
      stopBatchRef.current = null
    }
  }, [enabled, ready, wrapper])

  // toggle
  const toggle = useCallback(() => {
      if (!enabled) return
      if (timelineRef.current) {
        if (isPaused) {
        timelineRef.current.play();
        } else {  
          timelineRef.current.pause();
        }
        setIsPaused(!isPaused);
      }
  }, [enabled, isPaused])

  return { timeline: timelineRef.current, toggle, isPaused }
}
