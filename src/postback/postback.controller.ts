import { Controller, Get, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import { PostbackService } from './postback.service';

@Controller()
export class PostbackController {
  constructor(private readonly postbackService: PostbackService) {}

  @Get('tradingworks/:type')
  async tradingworks(@Param() param: { type: string }, @Req() request: Request) {
    const type: string = param.type;

    if (type === 'install') await this.postbackService.installTradingworks(request);
    else await this.postbackService.eventTradingworks(request);
  }

  @Get('airbridge/:type')
  async airbridge(@Param() param: { type: string }, @Req() request: Request) {
    const type: string = param.type;

    if (type === 'install') await this.postbackService.installAirbridge(request);
    else await this.postbackService.eventAirbridge(request);
  }

  @Get('appsflyer/:type')
  async appsflyer(@Param() param: { type: string }, @Req() request: Request) {
    const type: string = param.type;

    if (type === 'install') await this.postbackService.installAppsflyer(request);
    else await this.postbackService.eventAppsflyer(request);
  }

  @Get('adbrix-remaster/:type')
  async adbrixremaster(@Param() param: { type: string }, @Req() request: Request) {
    const type: string = param.type;

    if (type === 'install') await this.postbackService.installAdbrixremaster(request);
    else await this.postbackService.eventAdbrixremaster(request);
  }

  @Get('adjust/:type')
  async adjust(@Param() param: { type: string }, @Req() request: Request) {
    const type: string = param.type;

    if (type === 'install') await this.postbackService.installAdjust(request);
    else await this.postbackService.eventAdjust(request);
  }

  @Get('singular/:type')
  async singular(@Param() param: { type: string }, @Req() request: Request) {
    const type: string = param.type;

    if (type === 'install') await this.postbackService.installSingular(request);
    else await this.postbackService.eventSingular(request);
  }
}
