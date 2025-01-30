import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommonModule } from './modules/common/common.module';
import { PagesModule } from './modules/pages/pages.module';
import { EventsModule } from './modules/events/events.module';
import { UsersModule } from './modules/users/users.module';
import { SharedModulesModule } from './modules/shared-modules/shared-modules.module';
import { DatabaseModule } from './modules/database/database.module';

@Global()
@Module({
  imports: [
    AuthModule,

    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CommonModule,
    PagesModule,
    EventsModule,
    UsersModule,
    SharedModulesModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
