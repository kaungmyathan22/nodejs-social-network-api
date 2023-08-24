import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { unlink } from 'fs';
import { Repository } from 'typeorm';
import { StorageEntity } from './entities/storage.entity';

@Injectable()
export class StorageService {
  constructor(
    @InjectRepository(StorageEntity)
    private readonly storageRepository: Repository<StorageEntity>,
  ) {}

  create(file: Express.Multer.File) {
    return this.storageRepository.create(file);
  }

  remove(filename: string) {
    const filePath = `./uploads/${filename}`;
    unlink(filePath, (err) => {
      if (err) {
        console.error(`Error deleting file: ${err}`);
        console.log('Error deleting file');
      } else {
        console.log(`File ${filename} has been deleted`);
        console.log('File deleted successfully');
      }
    });
  }
}
