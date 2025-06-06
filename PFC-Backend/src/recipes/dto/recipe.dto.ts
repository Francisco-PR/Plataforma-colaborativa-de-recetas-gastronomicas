import { PartialType } from '@nestjs/mapped-types';
import { CreateRecipeDto } from './create-recipe.dto';
import { IsArray, IsDate } from 'class-validator';
import { CommentDto } from 'src/comments/dto/comment.dto';
import { UserPreviewDto } from 'src/users/dto/user-preview.dto';

export class RecipeDto {
    _id: unknown;
    title: string;
    description: string;
    ingredients: string[];
    steps: string[];
    image?: string;
    author: UserPreviewDto;
    ratings: number;
    comments: CommentDto[];
    categories: string[];
    preparationTime: number;
  }
  
