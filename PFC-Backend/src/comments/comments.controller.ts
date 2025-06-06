import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { GetUser } from 'src/decorators/user.decorator';
import { IsAdmin } from 'src/decorators/isAdmin.decorator';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}
  
  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() body: {content: string; recipe: string},
    @GetUser('_id') user: string,
  ) {
    const createCommentDto: CreateCommentDto = {user , ...body}
    return this.commentsService.create(createCommentDto);
  }

  //TODO ¿Deberia existir?
  @Get(':recipeId')
  findByRecipe(@Param('recipeId') recipeId: string) {
    return this.commentsService.findByRecipe(recipeId);
  }
  
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @GetUser('_id') userId: string,
  ) {
    return this.commentsService.update(id, updateCommentDto, userId);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @GetUser('_id') user: string,
    @IsAdmin() { isAdmin }: { isAdmin: boolean },
  ) {
    return this.commentsService.remove(id, user, isAdmin);
  }
}
