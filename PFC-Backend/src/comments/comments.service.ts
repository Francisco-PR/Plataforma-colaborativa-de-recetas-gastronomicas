import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { UserPreviewDto } from 'src/users/dto/user-preview.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  create(dto: CreateCommentDto) {
    const newComment = new this.commentModel(dto);
    return newComment.save();
  }

   //TODO ¿Deberia existir?
  findOne(id: string) {
    return this.commentModel.findByIdAndDelete(id).exec();
  }

  findByRecipe(recipeId: string) {
    return this.commentModel
      .find({ recipe: recipeId })
      .populate('user', 'username')
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(id: string, dto: UpdateCommentDto, userId: string) {
    const comment = await this.commentModel
      .findById(id)
      .populate<{ user: UserPreviewDto }>('user')
      .exec();

    if (!comment) {
      throw new NotFoundException('Comentario no encontrado');
    }
    if (comment.user._id.toString() !== userId.toString()) {
      throw new ForbiddenException('No tienes permiso para borrar este comentario');
    }

    await comment.updateOne(dto, { new: true });
    return comment
  }

  async remove(id: string, userId: string, isAdmin: boolean) {
    const comment = await this.commentModel
      .findById(id)
      .populate<{ user: UserPreviewDto }>('user')
      .exec();

    if (!comment) {
      throw new NotFoundException('Comentario no encontrado');
    }
    if ( !isAdmin ) {
      if (comment.user._id.toString() !== userId.toString()) {
        throw new ForbiddenException('No tienes permiso para borrar este comentario');
      }
    }

    await comment.deleteOne();
    return comment;
  }

}
