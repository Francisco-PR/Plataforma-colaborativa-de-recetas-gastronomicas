import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';

import { User, UserSchema } from './entities/user.entity';
import { Recipe, RecipeSchema } from 'src/recipes/entities/recipe.entity';
import { Comment, CommentSchema } from 'src/comments/entities/comment.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Recipe.name, schema: RecipeSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
    AuthModule,
  ],
})

export class UsersModule {}
