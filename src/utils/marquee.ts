export const sizeContainers = async (containers: HTMLDivElement[]) => {
  await new Promise(requestAnimationFrame)
  await new Promise(requestAnimationFrame)
  containers.forEach(div => {
    const mediaElement = div.querySelector("img, video") as HTMLElement | null
    if (!mediaElement) return
    mediaElement.offsetWidth
    const rect = mediaElement.getBoundingClientRect()
    let width = Math.round(rect.width)
    const height = rect.height
    const img = mediaElement as HTMLImageElement
    const video = mediaElement as HTMLVideoElement
    const imgRatio = img.naturalWidth > 0 && img.naturalHeight > 0
      ? img.naturalWidth / img.naturalHeight
      : 0
    const videoRatio = video.videoWidth > 0 && video.videoHeight > 0
      ? video.videoWidth / video.videoHeight
      : 0
    const ratio = imgRatio || videoRatio
    if (ratio > 0 && height > 0) {
      // Use intrinsic aspect ratio so max-width clamping doesn't freeze width on resize.
      width = Math.round(height * ratio)
    }
    div.style.width = `${width}px`
  })
}
