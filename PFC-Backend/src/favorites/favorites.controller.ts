import { Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { GetUser } from 'src/decorators/user.decorator';


@Controller('favorites')
export class FavoritesController {
  constructor( private readonly favoritesService: FavoritesService ) {}
  @UseGuards( AuthGuard )
  @Get()
  async getFavorites(
    @GetUser('_id') userId: string,
    @Query() query: { page?: number }
  ) {
    const { page: queryPage } = query
    return this.favoritesService.getFavoriteRecipes( userId, queryPage );
  }
  @UseGuards( AuthGuard )
  @Post(':recipeId')
  async addFavorite(
    @Param('recipeId') recipeId: string,
    @GetUser('_id') userId: string,
  ) {
    return this.favoritesService.addFavoriteRecipe( userId, recipeId );
  }

  @UseGuards( AuthGuard )
  @Delete(':recipeId')
  async removeFavorite(
    @Param('recipeId') recipeId: string,
    @GetUser('_id') userId: string,
  ) {
    return this.favoritesService.removeFavoriteRecipe( userId, recipeId );
  }

  @UseGuards( AuthGuard )
  @Get(':recipeId')
  async isFavorite(
    @Param('recipeId') recipeId: string,
    @GetUser('_id') userId: string,
  ) {
    return this.favoritesService.isRecipeFavorite( userId, recipeId );
  }
}