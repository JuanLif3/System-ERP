import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import toStream = require('streamifier');

@Injectable()
export class CloudinaryService {
  // Usamos 'any' para evitar el error "Namespace 'global.Express' has no exported member 'Multer'"
  async uploadImage(file: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'nexus-erp-products' }, // Carpeta en Cloudinary
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      
      toStream.createReadStream(file.buffer).pipe(upload);
    });
  }
}