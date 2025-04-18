import { forwardRef, Module } from '@nestjs/common';
import { PagesEventsService } from './pages-events.service';
import { PagesEventsController } from './pages-events.controller';
import { EventsModule } from 'src/modules/events/events.module';
import { PagesModule } from '../pages.module';
import { PagesEventsRepository } from './pages-events.repository';

@Module({
  imports: [EventsModule, forwardRef(() => PagesModule)],
  providers: [PagesEventsService, PagesEventsRepository],
  controllers: [PagesEventsController],
})
export class PagesEventsModule {}
