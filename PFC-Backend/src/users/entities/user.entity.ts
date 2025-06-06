import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {

  _id?: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, minlength: 6 })
  password?: string;

  @Prop({ type: [String], default: ['user'] })
  roles: string[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
    default: [],
  })
  favoriteRecipes: Types.ObjectId[];
  @Prop({ type: Date || null, default: null })
  bannedUntil: Date | null
}

export const UserSchema = SchemaFactory.createForClass(User);