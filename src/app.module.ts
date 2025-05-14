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
import { UploadMediaModule } from './modules/common/upload-media/upload-media.module';
import { CommunityModule } from './modules/community/community.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { I18nExceptionFilter } from './modules/common/filters/i18n-exception.filter';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { I18nResponseInterceptor } from './modules/common/filters/i18n-response.interceptor';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { NotificationQueueModule } from './modules/common/queues/notification-queue/notification-queue.module';
import { UtilsModule } from './modules/utils/utils.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
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
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: join(__dirname, 'i18n'),
        watch: true,
        includeSubfolders: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        { use: HeaderResolver, options: ['x-custom-lang'] },
        AcceptLanguageResolver,
      ],
    }),
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
    UploadMediaModule,
    CommunityModule,
    NotificationsModule,
    NotificationQueueModule,
    UtilsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: I18nExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: I18nResponseInterceptor },
  ],
  exports: [
    DrizzleModule,
    PointingSystemModule,
    BullMQModule,
    CommonModule,
    UsersModule,
    UploadMediaModule,
    NotificationQueueModule,
  ],
})
export class AppModule {}
