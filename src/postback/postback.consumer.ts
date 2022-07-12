import { Process, Processor } from '@nestjs/bull';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from 'bull';
import { Model } from 'mongoose';
import { Daily, DailyDocument } from 'src/schema/daily';
import { Postback, PostbackDocument } from 'src/schema/postback';
import * as moment from 'moment-timezone';
import { Event, EventDocument } from 'src/schema/event';
import { InjectRepository } from '@nestjs/typeorm';
import PostbackInstallAdbrixremaster from '@entities/PostbackInstallAdbrixremaster';
import { Repository } from 'typeorm';
import { PostbackDaily, PostbackEventAdbrixremaster, PostbackRegisteredEvent } from '@entities/Entity';
import * as _ from 'lodash';
import { RedisService } from 'nestjs-redis';
import { Redis } from 'ioredis';

@Processor('postback')
export class PostbackConsumer {
  constructor(
    private readonly redisService: RedisService,
    @InjectModel(Daily.name) private readonly dailyModel: Model<DailyDocument>,
    @InjectModel(Event.name) private readonly eventModel: Model<EventDocument>,
    @InjectModel(Postback.name) private readonly postbackModel: Model<PostbackDocument>,
    @InjectRepository(PostbackDaily) private readonly postbackDailyRepository: Repository<PostbackDaily>,
    @InjectRepository(PostbackInstallAdbrixremaster) private readonly postbackInstallAdbrixremasterRepository: Repository<PostbackInstallAdbrixremaster>,
    @InjectRepository(PostbackEventAdbrixremaster) private readonly postbackEventAdbrixremasterRepository: Repository<PostbackEventAdbrixremaster>,
    @InjectRepository(PostbackRegisteredEvent) private readonly postbackRegisteredEventRepository: Repository<PostbackRegisteredEvent>,
  ) {}

  @Process()
  async postbackHandler(job: Job) {
    const data: Postback = job.data;
    const token: string = data.token;
    const impressionCode: string = data.impressionCode;
    const event_name: string = data.event_name;
    const revenue: number = data.revenue;

    const dailyInfo: Daily = await this.dailyModel.findOne({ impressionCode: impressionCode });

    if (!dailyInfo) return;

    const eventInstance: Event = await this.eventModel.findOne({
      token: token,
      tracker: event_name,
    });

    let inc = {};

    if (!eventInstance) inc = { unregistered: 1 };
    else if (eventInstance.admin == 'install') inc = { install: 1 };
    else if (eventInstance.admin == 'registration') inc = { registration: 1 };
    else if (eventInstance.admin == 'retention') inc = { retention: 1 };
    else if (eventInstance.admin == 'etc1') inc = { etc1: 1 };
    else if (eventInstance.admin == 'etc2') inc = { etc2: 1 };
    else if (eventInstance.admin == 'etc3') inc = { etc3: 1 };
    else if (eventInstance.admin == 'etc4') inc = { etc4: 1 };
    else if (eventInstance.admin == 'etc5') inc = { etc5: 1 };
    else if (eventInstance.admin == 'purchase') inc = { purchase: 1, revenue: revenue };

    const daily: Daily = await this.dailyModel.findOneAndUpdate(
      {
        impressionCode: impressionCode,
        createdAt: {
          $gte: moment().startOf('day').toISOString(),
          $lte: moment().endOf('day').toISOString(),
        },
      },
      { $inc: inc },
    );

    data.daily = daily;
    await this.postbackModel.create(data);
  }
}
