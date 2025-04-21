import { Module } from '@nestjs/common';
import { ActionsController } from './action.controller';
import { ActionsService } from './actions.service';
import { ActionsRepository } from './action.repository';

@Module({
    controllers: [ActionsController],
    providers: [ActionsService, ActionsRepository],
    exports: [ActionsService],
})
export class ActionsModule { }
