import { BullMQModule } from './modules/common/queues/bullMQ.module';
import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DrizzleModule } from './modules/db/drizzle.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './modules/common/common.module';
import { PagesModule } from './modules/pages/pages.module';
import { EventsModule } from './modules/events/events.module';
import { UsersModule } from './modules/users/users.module';
import { SharedModulesModule } from './modules/shared-modules/shared-modules.module';
import { ForumModule } from './modules/forum/forum.module';
import { BullModule } from '@nestjs/bullmq';
import { GroupsModule } from './modules/groups/groups.module';
import { ChallengesModule } from './modules/challenges/challenges.module';
import { ChatModule } from './modules/chat/chat.module';
import { PointingSystemModule } from './modules/pointing-system/pointing-system.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path/posix';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
@Global()
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
    }),
    DrizzleModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CommonModule,
    PagesModule,
    EventsModule,
    UsersModule,
    SharedModulesModule,
    ForumModule,
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: (process.env.REDIS_PORT || 6379) as number,
        password: process.env.REDIS_PASSWORD,
      },
    }),
    BullMQModule,
    GroupsModule,
    ChallengesModule,
    ChatModule,
    PointingSystemModule,
    SubscriptionsModule,
    PaymentsModule,
    MarketplaceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [DrizzleModule, PointingSystemModule, BullMQModule, CommonModule],
})
export class AppModule {}
