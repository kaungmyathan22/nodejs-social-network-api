import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
}
