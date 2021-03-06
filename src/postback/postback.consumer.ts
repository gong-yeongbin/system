import { Process, Processor } from '@nestjs/bull';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from 'bull';
import { Model } from 'mongoose';
import { Daily, DailyDocument } from 'src/schema/daily';
import { Postback, PostbackDocument } from 'src/schema/postback';
import * as moment from 'moment-timezone';
import { Event, EventDocument } from 'src/schema/event';
import { ImpressionCode, ImpressionCodeDocument } from 'src/schema/impressionCode';
import { Campaign, CampaignDocument } from 'src/schema/campaign';

@Processor('postback')
export class PostbackConsumer {
  constructor(
    @InjectModel(Daily.name) private readonly dailyModel: Model<DailyDocument>,
    @InjectModel(Event.name) private readonly eventModel: Model<EventDocument>,
    @InjectModel(Postback.name) private readonly postbackModel: Model<PostbackDocument>,
    @InjectModel(ImpressionCode.name) private readonly impressionCodeModel: Model<ImpressionCodeDocument>,
    @InjectModel(Campaign.name) private readonly campaignModel: Model<CampaignDocument>,
  ) {}

  @Process()
  async postbackHandler(job: Job) {
    const data: Postback = job.data;
    const token: string = data.token;
    const impressionCode: string = data.impressionCode;
    const event_name: string = data.event_name;
    const revenue: number = data.revenue;

    const campaignInstance: Campaign = await this.campaignModel.findOne({ token: token });
    const eventInstance: Event = await this.eventModel.findOne({
      tracker: event_name,
      campaign: campaignInstance,
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

    await this.postbackModel.create(data);
  }
}
