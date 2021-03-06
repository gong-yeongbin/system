import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { RedisService } from 'nestjs-redis';
import { Redis } from 'ioredis';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as moment from 'moment-timezone';

@Injectable()
export class DailyCacheMiddleware implements NestMiddleware {
  constructor(private readonly redisService: RedisService, @InjectQueue('daily') private readonly dailyQueue: Queue) {}

  async use(request: any, response: any, next: NextFunction): Promise<void> {
    const token: string = request.query.token;
    const pub_id: string = request.query.pub_id;
    const sub_id: string = request.query.sub_id;

    const redis: Redis = this.redisService.getClient();

    const isDailyCache: Boolean = Boolean(await redis.get(`${token}:${pub_id}:${sub_id}:${moment().tz('Asia/Seoul').format('YYYYMMDD')}:create`));

    if (!isDailyCache) {
      await this.dailyQueue.add({ token: token, pub_id: pub_id, sub_id: sub_id }, { removeOnComplete: true, removeOnFail: true, delay: 1000 });

      await redis.set(`${token}:${pub_id}:${sub_id}:${moment().tz('Asia/Seoul').format('YYYYMMDD')}:create`, 'true');
      await redis.expire(`${token}:${pub_id}:${sub_id}:${moment().tz('Asia/Seoul').format('YYYYMMDD')}:create`, 60 * 60 * 24);
    }

    next();
  }
}
