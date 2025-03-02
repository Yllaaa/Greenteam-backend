import { Module } from '@nestjs/common';
import { PointingSystemController } from './pointing-system.controller';
import { PointingSystemService } from './pointing-system.service';

@Module({
  controllers: [PointingSystemController],
  providers: [PointingSystemService]
})
export class PointingSystemModule {}
