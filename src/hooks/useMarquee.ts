import { useGSAP } from "@gsap/react"
import { useCallback, useRef, useState, type RefObject } from "react"
import { horizontalLoop } from "../utils/gsap/horizontalLoop"
import { useControls } from "leva"
import { checkReady } from "../utils/marquee"

export function useMarquee(wrapper: RefObject<HTMLDivElement | null>) {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [ready, setReady] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

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
  
  useGSAP((context, contextSafe) => 
    {
      const containers = wrapper.current ? (Array.from(wrapper.current.children) as HTMLDivElement[]) : []
      
      if (!containers.length || !containers[0]) {
        setReady(false)
        return
      }

      if (!ready) {
        checkReady(containers, () => setReady(true))
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
    
      return () => tl?.current.kill()
      
    },
    { scope: wrapper, dependencies: [ready, controls] }
  ); 

  // toggle
  const toggle = useCallback(() => {
      if (timelineRef.current) {
        if (isPaused) {
        timelineRef.current.play();
        } else {  
          timelineRef.current.pause();
        }
        setIsPaused(!isPaused);
      }
  }, [isPaused, setIsPaused, timelineRef.current])

  return { timeline: timelineRef.current, toggle, isPaused }
}
