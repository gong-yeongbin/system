import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TrackingModule } from './tracking/tracking.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from 'nestjs-redis';
import { AppsflyerModule } from './appsflyer/appsflyer.module';
import { AdbrixremasterModule } from './adbrixremaster/adbrixremaster.module';
import { AdjustModule } from './adjust/adjust.module';
import { SingularModule } from './singular/singular.module';
import { MongooseModule } from '@nestjs/mongoose';
import { DeveloperModule } from './developer/developer.module';
import { ClusterService } from './cluster.service';
import { PostbackModule } from './postback/postback.module';

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
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST,
      port: +process.env.MYSQL_PORT,
      username: process.env.MYSQL_USERNAME,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      synchronize: false,
      entities: [__dirname + '/**/*{.ts,.js}'],
    }),
    MongooseModule.forRoot(process.env.MONGODB_URL),
    TrackingModule,
    // AppsflyerModule,
    // AdbrixremasterModule,
    // AdjustModule,
    // SingularModule,
    DeveloperModule,
    PostbackModule,
  ],
  controllers: [AppController],
  providers: [AppService, ClusterService],
  exports: [ConfigModule],
})
export class AppModule {}
