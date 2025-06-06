import { IsNotEmpty, IsOptional, IsArray, IsNumber, Min } from 'class-validator';

export class CreateRecipeDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  @IsArray()
  ingredients: string[];

  @IsArray()
  steps: string[];

  @IsOptional()
  image?: string;

  @IsArray()
  @IsOptional()
  categories?: string[];

  @IsNumber()
  @Min(1)
  preparationTime: number;
}
