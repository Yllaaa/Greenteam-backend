import { Module } from '@nestjs/common';
import { SuggestionsService } from './suggestions.service';
import { SuggestionsRepository } from './suggestions.repository';
import { SuggestionsController } from './suggestions.controller';

@Module({
    imports: [],
    controllers: [SuggestionsController],
    providers: [SuggestionsService, SuggestionsRepository],
    exports: [SuggestionsService],
})
export class SuggestionsModule { }
