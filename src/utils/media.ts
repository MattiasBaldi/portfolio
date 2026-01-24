export const isImage = (media: string) => media ? /\.(webp|heic|gif|avif|jpeg|jpg|png)$/i.test(media) : null
export const isVideo = (media: string) => media ? /\.(mov|mp4|webm|m4v)$/i.test(media) : null

const q = (o: Record<string, string | number | undefined>) => Object.entries(o).filter(([, v]) => v != null).map(([k, v]) => `${k}=${v}`).join(',') //prettier-ignore

/** @see https://developers.cloudflare.com/images/transform-images/  */
export const cfImage = (path: string, opts = {}, domain = 'portfolio-64h.pages.dev') => `https://${domain}/cdn-cgi/image/${q(opts)}/${path}`

/** @see https://developers.cloudflare.com/stream/transform-videos/  */
export const cfMedia = (path: string, opts = {}, domain = 'portfolio-64h.pages.dev') => `https://${domain}/cdn-cgi/media/${q(opts)}/${path}`
