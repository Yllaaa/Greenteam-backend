import { Module } from '@nestjs/common';
import { FolloweesRepository } from './followees.repository';
import { FolloweesService } from './followees.service';
import { FolloweesController } from './followees.controller';

@Module({
    controllers: [FolloweesController],
    providers: [FolloweesRepository, FolloweesService],
    exports: [FolloweesService],
})
export class FolloweesModule { }
