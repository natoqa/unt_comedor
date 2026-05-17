import { v2 as cloudinary } from 'cloudinary';
import { config } from './env';

if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ secure: true });
} else {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
}

export { cloudinary };
