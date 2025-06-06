import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Recipe, RecipeDocument } from './entities/recipe.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipeDto } from './dto/recipe.dto';

import { Comment, CommentDocument } from 'src/comments/entities/comment.entity';
import { UserPreviewDto } from 'src/users/dto/user-preview.dto';
import { CommentDto } from 'src/comments/dto/comment.dto';
import { Rating } from './interfaces/rating.interface';

@Injectable()
export class RecipesService {
  constructor(
    @InjectModel(Recipe.name) private recipeModel: Model<RecipeDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>
  ) {}

  create(dto: CreateRecipeDto, userId: string) {
    const newRecipe = new this.recipeModel({
      ...dto,
      author: userId.toString()
    });
    return newRecipe.save();
  }

  async findAll(query: {
    title?: string;
    ingredients?: string;
    author?: string;
    categories?: string[]; // múltiple
    minPrepTime?: number;
    maxPrepTime?: number;
    page?: number;
    limit?: number;
  }) {
    const filter: any = {};
  
    // Filtros existentes
    if (query.title) filter.title = new RegExp(query.title, 'i');
    if (query.ingredients) filter.ingredients = new RegExp(query.ingredients, 'i');
    if (query.author) filter.author = query.author;
  
    // Nuevo: filtro por múltiples categorías (array de strings)
    if (query.categories && query.categories.length > 0) {
      filter.categories = { $all: query.categories }; // Recetas que contengan **todas** las categorías
      // Si prefieres que contenga **alguna**, usa: { $in: query.categories }
    }
  
    // Nuevo: filtro por rango de tiempo de preparación
    if (query.minPrepTime || query.maxPrepTime) {
      filter.preparationTime = {};
      if (query.minPrepTime) filter.preparationTime.$gte = query.minPrepTime;
      if (query.maxPrepTime) filter.preparationTime.$lte = query.maxPrepTime;
    }
  
    const page = query.page || 1;
    const limit = query.limit || 10;
  
    const totalCount = await this.recipeModel.countDocuments(filter).exec();
  
    const recipes = await this.recipeModel
      .find(filter)
      .populate('author', 'username')
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
  
    const recipesResp = recipes.map(recipe => {
      const recipeObj = recipe.toObject();      
      return {
        ...recipeObj,
        ratings: this.calculateAverageRating(recipeObj.ratings),
      };
    });
  
    return {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      resp: recipesResp,
    };
  }
    

  async getRecipeWithComments(id: string, userId: string) {
    const recipe = await this.recipeModel
      .findById(id)
      .populate<{author: UserPreviewDto}>('author')
      

    if (!recipe) {
      throw new NotFoundException('Receta no encontrada');
    }

    const comments = await this.commentModel
      .find({ recipe: id })
      .populate<{user: UserPreviewDto}>('user')
      .sort({ createdAt: -1 })
      .exec()

    const commentsDTO: CommentDto[] = comments.map(comment => ({
      _id: comment._id,
      content: comment.content,
      user: {
        _id: comment.user._id.toString(),
        username: comment.user.username,
      },
    }));

    const recipeDTO: RecipeDto = {
      _id: recipe._id,
      title: recipe.title,
      description: recipe.description,
      categories: recipe.categories,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      preparationTime: recipe.preparationTime,
      image: recipe.image,
      author: {
        _id: recipe.author._id.toString(),
        username: recipe.author.username,
      },
      ratings: this.calculateAverageRating(recipe.ratings),
      comments: commentsDTO,
    };

    if (userId) {
      const userRating = recipe.ratings.find(rating => rating.user.toString() === userId) || null
      return { ...recipeDTO, userRating }; // Incluimos el rating del usuario si está disponible
    }
  
    return recipeDTO; // Devolvemos la receta sin el rating del usuario
  }

  async update(id: string, dto: UpdateRecipeDto, userId: string) {

    const recipe = await this.recipeModel.findById(id).exec()
    if (!recipe) throw new NotFoundException('Receta no encontrada.');
    if( recipe.author.toString() !== userId.toString() ) {
      throw new NotFoundException('La receta no pertenece al usuario.');
    }
   
    return recipe.updateOne(dto, { new: true });
  }

  async remove(id: string, userId: string, isAdmin: boolean) {
    const recipe = await this.recipeModel.findById(id).exec()
    
    if (!recipe) throw new NotFoundException('Receta no encontrada.');

    if( !isAdmin ){
      if( recipe.author.toString() !== userId.toString() ) {
        throw new UnauthorizedException('La receta no pertenece al usuario.');  
      }
   }

    await this.commentModel.deleteMany({ recipe: id })
    return recipe.deleteOne();
  }

  async rateRecipe(recipeId: string, userId: string, value: number) {
    if (value < 0 || value > 5) {
      throw new BadRequestException('El rating debe estar entre 0 y 5.');
    }

    const recipe = await this.recipeModel.findById(recipeId);
    if (!recipe) throw new NotFoundException('Receta no encontrada.');
    
    
    // Buscar si el usuario ya ha puntuado
    const existingRating = recipe.ratings.find(
      (rating) => rating.user.toString() === userId.toString() 
    );
    if (existingRating) {
      // Actualizar su puntuación
      existingRating.value = value;
    } else {
      // Añadir un nuevo rating
      recipe.ratings.push({
        user: new Types.ObjectId(userId),
        value,
      });
    }

    await recipe.save();
    return {
      message: 'Rating actualizado',
      averageRating: this.calculateAverageRating(recipe.ratings),
    };
  }

  calculateAverageRating(ratings: Rating[]): number {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.value, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  }
  
}
