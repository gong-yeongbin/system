import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Campaign } from 'src/entities/Campaign';
import { SubMedia } from 'src/entities/SubMedia';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import { TrackingDto } from './dto/tracking.dto';
import { convertTrackerTrackingUrl } from '../common/util';
import * as moment from 'moment';

@Injectable()
export class TrackingService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    @InjectRepository(SubMedia)
    private readonly submediaRepository: Repository<SubMedia>,
  ) {}

  async tracking(requestQuery: TrackingDto): Promise<string> {
    Logger.log(`[media -> mecrosspro] : ${JSON.stringify(requestQuery)}`);

    //3. 노출용코드 관련
    const cpToken: string = requestQuery.token;
    const pubId: string = requestQuery.pub_id;
    const subId: string =
      requestQuery.sub_id == '' ||
      requestQuery.sub_id == undefined ||
      requestQuery.sub_id == '{sub_id}'
        ? ''
        : requestQuery.sub_id;

    //2. 캠페인 토큰 검증 (캠페인 및 광고앱 차단 여부 확인)
    const campaignEntity: Campaign = await this.campaignRepository.findOne({
      where: {
        cpToken: cpToken,
        cpStatus: true,
      },
      relations: ['media', 'advertising', 'advertising.tracker'],
    });

    if (!campaignEntity) {
      throw new NotFoundException();
    }

    const submediaEntity: SubMedia = await this.submediaRepository.findOne({
      where: {
        cpToken: cpToken,
        pubId: pubId,
        subId: subId,
      },
      relations: ['advertising', 'media', 'advertising.tracker'],
    });

    //새로운 노출용코드 생성
    let viewCode: string = null;

    //기존 노출용코드 반환
    if (!submediaEntity) {
      viewCode = v4().replace(/-/g, '');

      const submedia: SubMedia = new SubMedia();
      submedia.media = campaignEntity.media;
      submedia.cpToken = requestQuery.token;
      submedia.viewCode = viewCode;
      submedia.pubId = pubId;
      submedia.subId = subId;
      submedia.campaign = campaignEntity;
      submedia.advertising = campaignEntity.advertising;

      await this.submediaRepository.save(submedia);
    } else {
      viewCode = submediaEntity.viewCode;
    }

    //4. 메크로스Pro 트래킹 URL 를 트래커 트래킹 URL 변환
    const convertedTrackingUrl: string = convertTrackerTrackingUrl(
      campaignEntity.advertising.tracker.tkCode,
      campaignEntity.trackerTrackingUrl,
      requestQuery,
      viewCode,
    );

    //5. 트래커 트래킹 URL를 실행
    if (convertedTrackingUrl !== null) {
      const submediaEntity: SubMedia = await this.submediaRepository
        .createQueryBuilder('submedia')
        .where('submedia.pubId =:pubId and submedia.subId', {
          pubId: pubId,
          subId: subId,
        })
        .andWhere('Date(submedia.createdAt) =:date ', {
          date: moment().format('YYYY-MM-DD'),
        })
        .getOne();

      submediaEntity.click = Number(submediaEntity.click) + 1;
      await this.submediaRepository.save(submediaEntity);

      return convertedTrackingUrl;
    }
  }
}
