import { PartialType } from '@nestjs/mapped-types';
import { CreateCommentDto } from './create-comment.dto';
import { IsDate } from 'class-validator';
import { UserPreviewDto } from 'src/users/dto/user-preview.dto';

export class CommentDto {
    _id: unknown;
    content: string;
    user: UserPreviewDto;
}