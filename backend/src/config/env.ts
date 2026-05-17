import dotenv from 'dotenv';

dotenv.config();

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

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },

  cors: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
} as const;
