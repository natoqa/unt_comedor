import dotenv from 'dotenv';

dotenv.config();

function parseCloudinaryEnv() {
  let cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
  let apiKey = process.env.CLOUDINARY_API_KEY || '';
  let apiSecret = process.env.CLOUDINARY_API_SECRET || '';

  const url = process.env.CLOUDINARY_URL?.trim();
  if (url) {
    const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@([^/?]+)/);
    if (match) {
      apiKey = match[1];
      apiSecret = decodeURIComponent(match[2]);
      cloudName = match[3];
    }
    // Evita que el SDK parsee CLOUDINARY_URL al importar (puede lanzar Invalid URL)
    delete process.env.CLOUDINARY_URL;
  }

  return { cloudName, apiKey, apiSecret };
}

const cloudinaryEnv = parseCloudinaryEnv();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    url: process.env.DATABASE_URL || '',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  cloudinary: cloudinaryEnv,

  cors: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
} as const;
