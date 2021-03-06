import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type MobiconnectInstallDocument = MobiconnectInstall & Document;

@Schema({ versionKey: false, collection: 'mobiconnect_install', timestamps: { createdAt: 'createdAt', updatedAt: false } })
export class MobiconnectInstall {
  @Prop({ type: String })
  pub_id: string;

  @Prop({ type: String })
  sub_pub_id: string;

  @Prop({ type: String })
  click_id: string;

  @Prop({ type: String })
  gaid: string;

  @Prop({ type: String })
  idfa: string;

  @Prop({ type: String })
  android_id: string;

  @Prop({ type: String })
  custom1: string;

  @Prop({ type: String })
  custom2: string;

  @Prop({ type: String })
  custom3: string;

  @Prop({ type: String })
  os: string;

  @Prop({ type: String })
  ip: string;

  @Prop({ type: String })
  carrier: string;

  @Prop({ type: String })
  country_code: string;

  @Prop({ type: String })
  language: string;

  @Prop({ type: Number })
  click_timestamp: number;

  @Prop({ type: Number })
  install_timestamp: number;
}

export const MobiconnectInstallSchema = SchemaFactory.createForClass(MobiconnectInstall);
MobiconnectInstallSchema.index({ createdAt: 1 }, { expires: 60 * 60 * 24 * 30 * 12 });
