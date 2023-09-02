import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';

@Module({
  imports: [],
  controllers: [MetricsController],
})
export class MetricsModule {}
