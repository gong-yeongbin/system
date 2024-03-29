import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { RedisService } from 'nestjs-redis';
import { Redis } from 'ioredis';
import { v4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { PostbackDaily } from '@entities/Entity';
import { Repository } from 'typeorm';

@Injectable()
export class ImpressionCodeCacheMiddleware implements NestMiddleware {
  constructor(
    private readonly redisService: RedisService,
    @InjectRepository(PostbackDaily) private readonly postbackDailyRepository: Repository<PostbackDaily>,
  ) {}

  async use(request: any, response: any, next: NextFunction): Promise<void> {
    const token: string = request.query.token;
    const pub_id: string = request.query.pub_id;
    const sub_id: string = request.query.sub_id;

    const redis: Redis = this.redisService.getClient();

    const isValidation: string = await redis.get(`${token}:${pub_id}:${sub_id}`);
    isValidation ? isValidation : await redis.set(`${token}:${pub_id}:${sub_id}`, v4().replace(/-/g, ''));

    await redis.expire(`${token}:${pub_id}:${sub_id}`, 60 * 60 * 24 * 2);

    await redis.hset('view_code', `${token}/${pub_id}/${sub_id}`, await redis.get(`${token}:${pub_id}:${sub_id}`));

    next();
  }
}
