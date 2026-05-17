import type { MenuImage } from '@/types';

/** Usa la URL que devuelve la API (ya normalizada en el backend). */
export function resolveMenuImageUrl(
  image: MenuImage | null | undefined
): string | null {
  if (!image?.url) return null;
  return image.url;
}
