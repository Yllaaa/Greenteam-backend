import { BlogsModule } from './modules/news/blogs/blogs.module';
import { NewsModule } from './modules/news/news.module';
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
import { ScheduleModule } from '@nestjs/schedule';

@Global()
@Module({
  imports: [
    BlogsModule,
    NewsModule,
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
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [DrizzleModule],
})
export class AppModule { }
