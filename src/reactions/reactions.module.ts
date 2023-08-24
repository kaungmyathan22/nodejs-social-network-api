import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReactionEntity } from './entities/reaction.entity';
import { ReactionsController } from './reactions.controller';
import { ReactionsService } from './reactions.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReactionEntity])],
  controllers: [ReactionsController],
  providers: [ReactionsService],
})
export class ReactionsModule {}
