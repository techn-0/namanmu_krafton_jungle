import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop()
  password: string;

  @Prop()
  email: string;

  @Prop()
  providerId: string;

  @Prop()
  provider: string;

  @Prop({ default: 5 })
  tier: number;

  @Prop()
  profilepic:string;

  @Prop()
  percentile: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
