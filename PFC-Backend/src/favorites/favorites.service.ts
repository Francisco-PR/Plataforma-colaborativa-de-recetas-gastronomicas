import { Injectable, NotFoundException, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/users/entities/user.entity';
import { Recipe, RecipeDocument } from 'src/recipes/entities/recipe.entity';
import { Rating } from 'src/recipes/interfaces/rating.interface';


@Injectable()
export class FavoritesService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Recipe.name) private recipeModel: Model<RecipeDocument>,
  ) {}

  async getFavoriteRecipes(userId: string, queryPage?: number) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const totalCount = await this.recipeModel.countDocuments({ _id: { $in: user.favoriteRecipes } }).exec();
  
    const page = queryPage || 1;
    const limit = 3;

    // Buscar recetas favoritas que existen en la base de datos
    const favoriteRecipes = await this.recipeModel
      .find({ _id: { $in: user.favoriteRecipes } })
      .populate('author', 'username')
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const existingFavoriteRecipes = await this.recipeModel.find({ _id: { $in: user.favoriteRecipes } })
    // Extraer solo los IDs existentes
    const existingIds = existingFavoriteRecipes.map(recipe => {
      const recipeId = recipe._id as Types.ObjectId
      return recipeId.toString()
    });
  
    // Filtrar las recetas favoritas eliminando las que ya no existen
    const filteredFavorites = user.favoriteRecipes.filter(id =>
      existingIds.includes(id.toString())
    );
  
    // Si hubo cambios, actualiza al usuario
    if (filteredFavorites.length !== user.favoriteRecipes.length) {
      user.favoriteRecipes = filteredFavorites;
      await user.save();
    }

    const recipesResp = favoriteRecipes.map(recipe => {
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

  async addFavoriteRecipe(userId: string, recipeId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const recipeObjectId = new Types.ObjectId(recipeId);

    if (!user.favoriteRecipes.includes(recipeObjectId)) {
      user.favoriteRecipes.push(recipeObjectId);
      await user.save();
    }

    return { message: 'Receta añadida a favoritos' };
  }

  async removeFavoriteRecipe(userId: string, recipeId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const recipeObjectId = new Types.ObjectId(recipeId);
    user.favoriteRecipes = user.favoriteRecipes.filter(id => !id.equals(recipeObjectId) );
    
    await user.save();

    return { message: 'Receta eliminada de favoritos' };
  }

  async isRecipeFavorite(userId: string, recipeId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const recipeObjectId = new Types.ObjectId(recipeId);

    const isFavorite = user.favoriteRecipes.includes(recipeObjectId);
    return { isFavorite: isFavorite };
  }

  calculateAverageRating(ratings: Rating[]): number {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.value, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  }
}
