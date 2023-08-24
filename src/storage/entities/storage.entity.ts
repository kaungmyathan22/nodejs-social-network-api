import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class StorageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  originalname: string; // '9eb732d79aad94beabd1fbb3ae25b54a.png';
  @Column()
  encoding: string; // '7bit';
  @Column()
  mimetype: string; // 'image/png';
  @Column()
  destination: string; // './uploads';
  @Column()
  filename: string; // '86c9bfa4-9288-49f7-8380-1911dc739e68.png';
  @Column()
  path: string; // 'uploads/86c9bfa4-9288-49f7-8380-1911dc739e68.png';
  @Column()
  size: number; // 11532;
}
