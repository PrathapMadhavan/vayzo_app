export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PIXELS = 2000000; // 2 Megapixels

export function validateImage(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error("No file selected."));
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return reject(new Error("Invalid file type. Only JPG, PNG, and WebP are allowed."));
    }
    
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      const pixels = img.width * img.height;
      if (pixels > MAX_PIXELS) {
        reject(new Error(`Image resolution too high. Maximum allowed is 2MP (currently ${Math.round(pixels/10000)/100}MP).`));
      } else {
        resolve(true);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Invalid or corrupted image file."));
    };
    
    img.src = url;
  });
}
