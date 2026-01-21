
export const waitVideos = async (videos: HTMLVideoElement[]) => {
    if (!videos.length) return
    await Promise.all(
      videos.map(
        video =>
          new Promise<void>(resolve => {
            video.muted = true
            video.controls = false

            if (video.readyState >= 1) {
              video.play().catch(() => {})
              resolve()
              return
            }

            const timeout = setTimeout(resolve, 2000)
            video.addEventListener(
              "loadedmetadata",
              () => {
                clearTimeout(timeout)
                video.play().catch(() => {})
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
          img.addEventListener("load", resolve, { once: true })
          img.addEventListener("error", resolve, { once: true })
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

export const checkReady = async (containers: HTMLDivElement[], onReady: () => void) => {
  const videos = containers.flatMap(div => Array.from(div.querySelectorAll("video")))
  const imgs = containers.flatMap(div => Array.from(div.querySelectorAll("img")))
  await waitVideos(videos)
  await waitImages(imgs)
  await sizeContainers(containers)
  onReady()
}
