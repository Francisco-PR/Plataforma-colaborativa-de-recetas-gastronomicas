import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';

import { RecipesService } from './recipes.service';
import { RecipesController } from './recipes.controller';
import { Recipe, RecipeSchema } from './entities/recipe.entity';
import { Comment, CommentSchema } from 'src/comments/entities/comment.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [RecipesController],
  providers: [RecipesService],
  imports: [
    MongooseModule.forFeature([
      { name: Recipe.name, schema: RecipeSchema },
      { name: Comment.name, schema: CommentSchema }
    ]),
    AuthModule,
  ],
  
})
export class RecipesModule {}
