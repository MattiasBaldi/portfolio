import { useGSAP } from "@gsap/react"
import { useCallback, useEffect, useRef, useState, type RefObject } from "react"
import { horizontalLoop } from "../utils/gsap/horizontalLoop"
import { useControls } from "leva"
import { checkReady, sizeContainers } from "../utils/marquee"
import { useResize } from "./useResize"

type UseMarqueeOptions = {
  enabled?: boolean
}

export function useMarquee(wrapper: RefObject<HTMLDivElement | null>, options: UseMarqueeOptions = {}) {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [ready, setReady] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0)
  const enabled = options.enabled ?? true
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastLogRef = useRef(0)

  const controls = useControls(
    "Marquee",
        {
          speed: {
            value: 0.5,
            min: 0,
            max: 5,
            step: 0.1,
            transient: false, 
            label: "Speed",
            onChange: (v: number) => null,
          },
          resistance: { value: 10, min: 1, max: 50, step: 1, label: "Drag Resistance" },
          minVelocity: { value: 50, min: 0, max: 200, step: 10, label: "Min Velocity" },
          repeat: { value: 0, min: 0, max: 20, step: 1, label: "Repeat" },
          gap: { value: 0, min: -20, max: 20, step: 1, label: "Gap" },
          draggable: { value: true, label: "Draggable" },
          dragSnap: { value: true, label: "Drag Snap" },
        },
        { collapsed: false }, 
    [timelineRef] // your deps
  );
  
  const {context, contextSafe} = useGSAP(() => 
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
        repeat: Infinity,
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
    { scope: wrapper, dependencies: [enabled, ready, controls, refreshKey], revertOnUpdate: true }
  ); 

  useEffect(() => {
    if (!enabled && timelineRef.current) {
      timelineRef.current.pause()
      setIsPaused(true)
    }
    if (enabled && timelineRef.current) {
      timelineRef.current.play()
      setIsPaused(false)
    }
    
    if (!enabled && wrapper.current) {
      observerRef.current?.disconnect()
      observerRef.current = null
      const videos = Array.from(wrapper.current.querySelectorAll("video"))
      videos.forEach((video) => video.pause())
    }
  }, [enabled])

  /** Observer */
  // Observe videos and force them to only play if they are in frame, else don't
  useEffect(() => {
    if (!enabled || !ready || !wrapper.current) return
    const videos = Array.from(wrapper.current.querySelectorAll("video"))
    if (!videos.length) return
    observerRef.current?.disconnect()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement
          if (entry.isIntersecting) {
            video.loop = true
            video.play(); 
          } else {
            video.pause()
          }
        })
        const now = Date.now()
        if (now - lastLogRef.current > 500) {
          lastLogRef.current = now
          const playingCount = videos.filter(
            (video) => !video.paused && !video.ended && video.readyState > 2
          ).length
          console.log("[marquee] videos playing:", playingCount)
        }
      },
      { threshold: 0.15 }
    )
    observerRef.current = observer
    videos.forEach((video) => observer.observe(video))
    return () => {
      observer.disconnect()
      observerRef.current = null
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

  // resize
  const refreshMarquee = useCallback(() => {
    if (!enabled || !ready || !wrapper.current) return
    const containers = Array.from(wrapper.current.children) as HTMLDivElement[]
    if (!containers.length) return
    void sizeContainers(containers).then(() => {
      setRefreshKey((value) => value + 1)
    })
  }, [enabled, ready, wrapper])

  useResize(refreshMarquee, { delay: 20 })

  useEffect(() => {
    if (!enabled) return
    refreshMarquee()
    console.log({enabled})
  }, [enabled, ready, refreshMarquee])

  return { timeline: timelineRef.current, toggle, isPaused }
}
