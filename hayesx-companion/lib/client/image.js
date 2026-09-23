'use client'

/** Downscales a photo on-device and returns a JPEG data URL (keeps uploads small on field connections). */
export async function compressImage(file, { maxSide = 1600, quality = 0.82 } = {}) {
  if (!file || !file.type?.startsWith('image/')) throw new Error('Choose a photo file.')
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error('That photo could not be read.'))
      i.src = url
    })
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight))
    const w = Math.max(1, Math.round(img.naturalWidth * scale))
    const h = Math.max(1, Math.round(img.naturalHeight * scale))
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, w, h)
    ctx.drawImage(img, 0, 0, w, h)
    let q = quality
    let dataUrl = canvas.toDataURL('image/jpeg', q)
    while (dataUrl.length > 1_200_000 && q > 0.35) {
      q -= 0.12
      dataUrl = canvas.toDataURL('image/jpeg', q)
    }
    return { dataUrl, width: w, height: h }
  } finally {
    URL.revokeObjectURL(url)
  }
}
