
export const waitVideos = async (videos: HTMLVideoElement[], playOnReady = true) => {
    if (!videos.length) return
    await Promise.all(
      videos.map(
        video =>
          new Promise<void>(resolve => {
            video.muted = true
            video.controls = false

            if (video.readyState >= 1) {
              if (playOnReady) video.play().catch(() => {})
              resolve()
              return
            }

            const timeout = setTimeout(resolve, 2000)
            video.addEventListener(
              "loadedmetadata",
              () => {
                clearTimeout(timeout)
                if (playOnReady) video.play().catch(() => {})
                resolve()
              },
              { once: true }
            )
            video.load()
          })
      )
    )
  }

export const waitImages = async (imgs: HTMLImageElement[]) => {
  if (!imgs.length) return
  await Promise.all(
    imgs.map(
      img =>
        new Promise<void>(resolve => {
          if (img.complete && img.naturalWidth > 0) {
            resolve()
            return
          }
          const handleLoad = () => resolve()
          img.addEventListener("load", handleLoad, { once: true })
          img.addEventListener("error", handleLoad, { once: true })
        })
    )
  )
}

export const sizeContainers = async (containers: HTMLDivElement[]) => {
  await new Promise(requestAnimationFrame)
  await new Promise(requestAnimationFrame)
  containers.forEach(div => {
    const mediaElement = div.querySelector("img, video") as HTMLElement | null
    if (!mediaElement) return
    mediaElement.offsetWidth
    const width = Math.round(mediaElement.getBoundingClientRect().width)
    div.style.width = `${width}px`
  })
}

export const checkReady = async (
  containers: HTMLDivElement[],
  onReady: () => void,
  options: { playVideos?: boolean } = {}
) => {
  const { playVideos = true } = options
  const videos = containers.flatMap(div => Array.from(div.querySelectorAll("video")))
  const imgs = containers.flatMap(div => Array.from(div.querySelectorAll("img")))
  await waitVideos(videos, playVideos)
  await waitImages(imgs)
  await sizeContainers(containers)
  onReady()
}

export const playVideosInBatches = (
  videos: HTMLVideoElement[],
  options: { batchSize?: number; delay?: number } = {}
) => {
  const { batchSize = 2, delay = 150 } = options
  const timeouts: number[] = []

  const startBatch = (startIndex: number) => {
    const batch = videos.slice(startIndex, startIndex + batchSize)
    batch.forEach(video => {
      if (video.paused) {
        video.play().catch(() => {})
      }
    })
    const nextIndex = startIndex + batchSize
    if (nextIndex < videos.length) {
      const id = window.setTimeout(() => startBatch(nextIndex), delay)
      timeouts.push(id)
    }
  }

  startBatch(0)

  return () => {
    timeouts.forEach(id => window.clearTimeout(id))
  }
}
