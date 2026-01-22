import { useCallback, useEffect, useRef, useState } from "react"

type UseResizeObjectOptions = {
  delay?: number
}

export function useResizeObject<T extends Element>(ref: React.RefObject<T | null>, onResize: () => void, options: UseResizeOptions = {})
{
  useEffect(() => {
    const el = ref.current; 
    if (!el) return; 

    const { delay = 50 } = options; 
    let timeoutId: number | undefined; 

    const observer = new ResizeObserver(() => {
      if (timeoutId) window.clearTimeout(timeoutId)
        timeoutId = window.setTimeout(onResize, delay)
    })

    observer.observe(el)

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId)
        observer.disconnect()
    }
  }, [ref, onResize, options])
}

type UseResizeOptions = {
  delay?: number, 
}
export function useResize(onResize: () => void, options: UseResizeOptions) {
  const [innerWidth, setInnerWidth] = useState<number>(window.innerWidth)
  const timeoutRef = useRef<number | undefined>(undefined)
  const { delay = 100 } = options

  const handleResize = useCallback(() => {
    if (window.innerWidth === innerWidth) return
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => {
      setInnerWidth(window.innerWidth)
      onResize()
    }, delay)
  }, [delay, innerWidth, onResize])
  
  useEffect(() => {
    window.addEventListener("resize", handleResize)
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
      window.removeEventListener("resize", handleResize)
    }

  }, [handleResize])
}
