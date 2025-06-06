import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from './entities/user.entity';
import { Recipe, RecipeDocument } from 'src/recipes/entities/recipe.entity';
import { Comment, CommentDocument } from 'src/comments/entities/comment.entity';
import { BanUserDto } from './dto/ban-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Recipe.name) private recipeModel: Model<RecipeDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>
    
  ) {}

  async findAll(query: {
    username?: string;
    isbanned?: string;
    page?: number;
  }) {
    const filter: any = {};

    if (query.username) filter.username = new RegExp(query.username, 'i');

    // Filtro para isBanned y bannedUntil
    if (query.isbanned !== undefined) {
      const today = new Date();
     
      
      if (query.isbanned === 'true') {
        // Si el usuario está baneado, se filtra por bannedUntil > fecha actual
        filter.bannedUntil = { $gt: today };
         
      }
      else {
        // Si no está baneado, se filtra por bannedUntil <= fecha actual o null
        filter.$or = [
          { bannedUntil: { $lte: today } },
          { bannedUntil: null }
        ];
      }
    }

    const page = query.page || 1;
    const limit = 6;

    const totalCount = await this.userModel.countDocuments(filter).exec();

    const users = await this.userModel
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

      return {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      resp: users,
    };
  }

  async remove(id: string, isAdmin?: boolean) {
    const user = await this.userModel.findById(id).exec();
    if ( !user ) throw new NotFoundException('Usuario no encontrado')

    if ( !isAdmin ) {
      if ( user._id.toString() !== id.toString() ) {
        throw new UnauthorizedException('El usuario no coincide')
      } 
    }

    await this.recipeModel.deleteMany({ author: id })
    await this.commentModel.deleteMany({ user: id })
    return user.deleteOne()
  }

  async findByIdWithFavorites(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('favoriteRecipes')
      .exec();
  
    if ( !user ) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async getFavoriteRecipes(userId: string, query: { page?: number; limit?: number }) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('Usuario no encontrado');
    
    // Paginación: obtener página y límite desde la consulta
    const page = query.page || 1; // Página actual (por defecto 1)
    const limit = query.limit || 10; // Número de resultados por página (por defecto 10)
  
    // Contar el número total de recetas favoritas
    const totalCount = await this.recipeModel
      .countDocuments({ _id: { $in: user.favoriteRecipes } })
      .exec();
  
    // Obtener las recetas favoritas para la página actual
    const favoriteRecipes = await this.recipeModel
      .find({ _id: { $in: user.favoriteRecipes } })
      .select('-ratings') // Excluir el campo 'ratings'
      .skip((page - 1) * limit) // Desplazamiento para la página actual
      .limit(limit) // Límite de resultados por página
      .exec();
      
    // Devolver el total de recetas favoritas y las recetas actuales
    return {
      totalCount, // Total de recetas favoritas
      totalPages: Math.ceil(totalCount / limit), // Total de páginas
      currentPage: page, // Página actual
      resp: favoriteRecipes, // Recetas favoritas para la página actual
    };
  }
    
  async banUser(userId: string, dto: BanUserDto): Promise<User> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.bannedUntil = new Date(dto.bannedUntil);
    await user.save();
    return user;
  }

  async unBanUser( userId: string ): Promise<User> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.bannedUntil = null
    await user.save();
    return user;
  }

}