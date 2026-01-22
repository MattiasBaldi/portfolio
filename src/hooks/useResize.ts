import { useEffect } from "react"

type UseResizeOptions = {
  delay?: number
}

export function useResize<T extends Element>(ref: React.RefObject<T | null>, onResize: () => void, options: UseResizeOptions = {})
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