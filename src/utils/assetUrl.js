/** Normalize stored upload paths for API persistence. */
export const normalizeStorageImagePath = (imageUrl) => {
  if (!imageUrl) return "";
  const trimmed = String(imageUrl).trim();
  if (!trimmed || trimmed.startsWith("data:")) return "";

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const { pathname } = new URL(trimmed);
      if (pathname.startsWith("/uploads/")) return pathname;
      if (pathname.startsWith("uploads/")) return `/${pathname}`;
    } catch {
      return trimmed;
    }
  }

  if (trimmed.startsWith("/uploads/")) return trimmed;
  if (trimmed.startsWith("uploads/")) return `/${trimmed}`;
  return trimmed;
};

/** Build a browser-loadable URL for uploaded assets (Vite/nginx proxy /uploads). */
export const buildAssetUrl = (imageUrl) => {
  if (!imageUrl) return "";
  const trimmed = String(imageUrl).trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("data:")) return trimmed;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;

  const storagePath = normalizeStorageImagePath(trimmed);
  return storagePath || trimmed;
};
