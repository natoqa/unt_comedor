import { config } from './env';
import { v2 as cloudinary } from 'cloudinary';

const { cloudName, apiKey, apiSecret } = config.cloudinary;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export { cloudinary };
