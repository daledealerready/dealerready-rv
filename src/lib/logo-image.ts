export function fileToLogoDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      const max = 180;
      const scale = Math.min(1, max / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error("Could not read that logo."));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const data = canvas.toDataURL("image/png");
      URL.revokeObjectURL(url);
      if (data.length > 180000) {
        reject(new Error("That logo is too large. Use a simpler image."));
        return;
      }
      resolve(data);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image."));
    };
    image.src = url;
  });
}

export function assertLogo(logo: string) {
  if (!logo) return "";
  if (!logo.startsWith("data:image/")) {
    throw new Error("Logo must be an image file.");
  }
  if (logo.length > 180000) {
    throw new Error("That logo is too large. Use a simpler image.");
  }
  return logo;
}
