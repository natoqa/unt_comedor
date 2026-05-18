import type { MenuImage } from '@/types';

/** Usa la URL que devuelve la API (ya normalizada en el backend). */
export function resolveMenuImageUrl(
  image: MenuImage | null | undefined
): string | null {
  if (!image?.url) return null;
  return image.url;
}

/** Versión con cache-busting para forzar recarga de imagen actualizada. */
export function resolveMenuImageUrlWithCache(
  image: MenuImage | null | undefined
): string | null {
  if (!image?.url) return null;
  const url = image.url;
  if (url.startsWith('http')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${Date.now()}`;
  }
  return url;
}
