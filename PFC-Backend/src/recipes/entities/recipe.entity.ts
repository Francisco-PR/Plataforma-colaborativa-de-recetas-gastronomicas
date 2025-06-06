import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RecipeDocument = Recipe & Document;

@Schema({ timestamps: true })
export class Recipe {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;
  
  @Prop({ type: [String], default: [] })
  categories: string[];

  @Prop({ type: [String], default: [] })
  ingredients: string[];

  @Prop({ type: [String], default: [] })
  steps: string[];

  @Prop({ type: Number, required: true }) // tiempo en minutos, por ejemplo
  preparationTime: number;

  @Prop()
  image: string; // URL o base64

  @Prop({ type: Types.ObjectId, ref: 'User' })
  author: Types.ObjectId;

  @Prop({
    type: [
      {
        user: { type: Types.ObjectId, ref: 'User', required: true },
        value: { type: Number, required: true, min: 0, max: 5 },
      },
    ],
    default: [],
  })
  ratings: {
    user: Types.ObjectId;
    value: number;
  }[];
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);
