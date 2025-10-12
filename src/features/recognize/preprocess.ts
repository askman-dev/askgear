export interface PreprocessResult {
  blob: Blob;
  mimeType: string;
  width: number;
  height: number;
  dataUrl: string;
}

// Resize keeping aspect ratio so that max(width, height) <= 1024.
export async function preprocessImageToMax1024(input: File | string): Promise<PreprocessResult> {
  // If the input is a File, convert it to a data: URL. Otherwise, assume it's already a URL.
  const src = typeof input === 'string' ? input : await blobToDataURL(input);

  try {
    const img = await loadImage(src);
    const { canvas, width, height } = drawToMaxCanvas(img, 1024);
    const mimeType = hasTransparency(canvas) ? 'image/png' : 'image/jpeg';
    const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b as Blob), mimeType, 0.85));
    const dataUrl = await blobToDataURL(blob); // Convert the processed canvas back to a dataUrl for the result
    return { blob, mimeType, width, height, dataUrl };
  } catch (error) {
    // Rethrow to notify the caller.
    throw error;
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => {
      reject(new Error('Failed to load image', { cause: err }));
    };
    img.src = src;
  });
}

function drawToMaxCanvas(img: HTMLImageElement, maxSide: number) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const ratio = Math.min(1, maxSide / Math.max(iw, ih));
  const width = Math.round(iw * ratio);
  const height = Math.round(ih * ratio);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, width, height);
  return { canvas, width, height };
}

function hasTransparency(canvas: HTMLCanvasElement) {
  // heuristically check alpha channel presence; not strict, but cheap
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, Math.min(16, width), Math.min(16, height)).data;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) return true;
  }
  return false;
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}
