import { HttpModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TrackingModule } from './tracking/tracking.module';
import { PostbackModule } from './postback/postback.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from 'nestjs-redis';
import { AppClusterService } from './app-cluster/app-cluster.service';
import { CommonService } from './common/common.service';
import {
  Campaign,
  PostbackDaily,
  PostbackRegisteredEvent,
  PostbackEventAdbrixremaster,
  PostbackInstallAdbrixremaster,
  PostbackUnregisteredEvent,
} from './entities/Entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.dev'],
      isGlobal: true,
    }),
    RedisModule.register({
      host: process.env.REDIS_HOST,
      port: +process.env.REDIS_PORT,
    }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 3,
    }),
    TypeOrmModule.forRoot({
      type: process.env.MYSQL_TYPE as 'mysql',
      host: process.env.MYSQL_HOST,
      port: +process.env.MYSQL_PORT,
      username: process.env.MYSQL_USERNAME,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      synchronize: false,
      entities: [__dirname + '/**/*{.ts,.js}'],
      connectTimeout: 5000,
    }),
    TypeOrmModule.forFeature([
      Campaign,
      PostbackDaily,
      PostbackRegisteredEvent,
      PostbackUnregisteredEvent,
      PostbackInstallAdbrixremaster,
      PostbackEventAdbrixremaster,
      PostbackDaily,
    ]),
    TrackingModule,
    PostbackModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppClusterService, CommonService],
  exports: [ConfigModule],
})
export class AppModule {}
