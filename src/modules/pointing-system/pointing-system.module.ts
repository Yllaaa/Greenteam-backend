import { Module } from '@nestjs/common';
import { PointingSystemController } from './pointing-system.controller';
import { PointingSystemService } from './pointing-system.service';
import { PointingSystemRepository } from './pointing-system.repository';

@Module({
  controllers: [PointingSystemController],
  providers: [PointingSystemService, PointingSystemRepository],
  exports: [PointingSystemService, PointingSystemRepository],
})
export class PointingSystemModule {}
