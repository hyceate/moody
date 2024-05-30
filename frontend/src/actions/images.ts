export const getImageDimensions = (url: string) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = (error) => {
      console.error(`Failed to load image from ${url}`, error);
      reject(new Error(`Failed to load image from ${url}`));
    };
    img.src = url;
  });
};
