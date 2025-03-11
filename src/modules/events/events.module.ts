import { Module } from '@nestjs/common';
import { EventsController } from './events/events.controller';
import { EventsService } from './events/events.service';
import { EventsRepository } from './events/events.repository';
import { EventCommentsModule } from './event-comments/event-comments.module';
import { RouterModule } from '@nestjs/core';
import { EventCommentsReactionsModule } from './event-comments/reactions/reactions.module';

const eventsRoutes = [
  { path: '/', module: EventCommentsModule },
  { path: '/comments/reactions', module: EventCommentsReactionsModule },
];
@Module({
  controllers: [EventsController],
  providers: [EventsService, EventsRepository],
  imports: [
    EventCommentsModule,
    RouterModule.register([
      { path: 'events', module: EventsModule, children: eventsRoutes },
    ]),
  ],
})
export class EventsModule {}
