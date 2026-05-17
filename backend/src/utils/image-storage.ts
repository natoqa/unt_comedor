import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { cloudinary } from '../config';
import { config } from '../config/env';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'menus');
const LOCAL_PUBLIC_ID_PREFIX = 'local:';

function isLocalPublicId(publicId: string) {
  return publicId.startsWith(LOCAL_PUBLIC_ID_PREFIX);
}

function useLocalStorageOnly() {
  return process.env.USE_LOCAL_UPLOADS === 'true';
}

function getCloudinaryCloudName(): string | null {
  const { cloudName } = config.cloudinary;
  if (cloudName && cloudName !== 'tu_cloud_name') return cloudName;
  return null;
}

function hasCloudinaryCredentials() {
  const { cloudName, apiKey, apiSecret } = config.cloudinary;
  if (!cloudName || !apiKey || !apiSecret) return false;
  const placeholders = ['tu_cloud_name', 'tu_api_key', 'tu_api_secret'];
  return !placeholders.some(
    (p) => cloudName === p || apiKey === p || apiSecret === p
  );
}

/** URL usable en el cliente a partir del registro en BD */
export function resolveMenuImageUrl(image: {
  url: string;
  publicId: string;
}): string {
  if (image.publicId.startsWith(LOCAL_PUBLIC_ID_PREFIX)) {
    return image.url;
  }

  if (image.url.startsWith('https://res.cloudinary.com/')) {
    return image.url;
  }

  const cloudName = getCloudinaryCloudName();
  if (cloudName) {
    return `https://res.cloudinary.com/${cloudName}/image/upload/${image.publicId}`;
  }

  return image.url;
}

function getUploadOptions(): Record<string, string> {
  const options: Record<string, string> = { folder: 'unt-comedor/menus' };
  const preset = process.env.CLOUDINARY_UPLOAD_PRESET?.trim();
  if (preset) options.upload_preset = preset;
  return options;
}

async function uploadToCloudinary(file: Express.Multer.File) {
  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      getUploadOptions(),
      (error, result) => {
        if (error) reject(error);
        else if (!result?.secure_url || !result.public_id) {
          reject(new Error('Respuesta inválida de Cloudinary'));
        } else {
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      }
    );
    stream.end(file.buffer);
  });
}

function isCloudinaryAuthError(error: unknown): boolean {
  const err = error as { http_code?: number; message?: string };
  return (
    err.http_code === 401 ||
    err.http_code === 403 ||
    err.message?.includes('Invalid Signature') === true
  );
}

async function uploadToLocal(file: Express.Multer.File) {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const ext = path.extname(file.originalname) || '.jpg';
  const filename = `${randomUUID()}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(filepath, file.buffer);

  const baseUrl = process.env.API_PUBLIC_URL || `http://localhost:${config.port}`;
  return {
    url: `${baseUrl}/uploads/menus/${filename}`,
    publicId: `${LOCAL_PUBLIC_ID_PREFIX}${filename}`,
  };
}

export async function uploadMenuImage(file: Express.Multer.File) {
  if (useLocalStorageOnly() || !hasCloudinaryCredentials()) {
    return uploadToLocal(file);
  }

  try {
    return await uploadToCloudinary(file);
  } catch (error) {
    if (isCloudinaryAuthError(error)) {
      const err = error as { http_code?: number; message?: string };
      console.warn(
        `[Cloudinary ${err.http_code ?? 'error'}] Subida rechazada. Usando almacenamiento local.`,
        'Verifica API Key/Secret en console.cloudinary.com o define CLOUDINARY_UPLOAD_PRESET con un preset sin firma.'
      );
      return uploadToLocal(file);
    }
    throw error;
  }
}

export async function deleteMenuImage(publicId: string) {
  if (isLocalPublicId(publicId)) {
    const filename = publicId.slice(LOCAL_PUBLIC_ID_PREFIX.length);
    const filepath = path.join(UPLOAD_DIR, filename);
    await fs.unlink(filepath).catch(() => undefined);
    return;
  }

  if (hasCloudinaryCredentials()) {
    await cloudinary.uploader.destroy(publicId).catch((error) => {
      if (!isCloudinaryAuthError(error)) {
        console.warn('No se pudo eliminar imagen en Cloudinary:', (error as Error).message);
      }
    });
  }
}
