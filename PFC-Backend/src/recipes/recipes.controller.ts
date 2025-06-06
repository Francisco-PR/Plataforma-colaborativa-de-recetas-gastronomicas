import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { GetUser } from 'src/decorators/user.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { IsAdmin } from 'src/decorators/isAdmin.decorator';

@Controller('recipes')
export class RecipesController {
  constructor( private readonly recipesService: RecipesService ) {}

  @UseGuards( AuthGuard )
  @Post()
  create(
    @Body() dto: CreateRecipeDto,
    @GetUser('_id') userId: string,
  ) {
    return this.recipesService.create( dto, userId );
  }
  
  @Get()
  findAll(
    @Query() query: {
      title?: string;
      ingredients?: string;
      author?: string;
      categories?: string;
      minPrepTime?: number;
      maxPrepTime?: number;
      page?: number;
      limit?: number;
    }
  ) {
    // Convertimos `categories` de string separado por comas a array
    const finalQuery = {
      ...query,
      categories: query.categories
        ? query.categories.split( ',' ).map( c => c.trim() )
        : undefined,
    };

    return this.recipesService.findAll( finalQuery );
  }
  
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query() query: { user: string }
  ) {
    const { user: userId } = query;
    return this.recipesService.getRecipeWithComments( id, userId );
  }
  
  @UseGuards( AuthGuard )
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRecipeDto,
    @GetUser('_id') userId: string,
  ) {
    return this.recipesService.update( id, dto, userId );
  }

  @UseGuards( AuthGuard )
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @GetUser('_id') userId: string,
    @IsAdmin() { isAdmin }: { isAdmin: boolean },
  ) {    
    return this.recipesService.remove( id, userId, isAdmin );
  }
  
  @UseGuards( AuthGuard )
  @Post(':id/rate')
  rateRecipe(
    @Param('id') recipeId: string,
    @Body() body: { value: number },
    @GetUser('_id') userId: string,
  ) {
    const { value } = body;
    return this.recipesService.rateRecipe( recipeId, userId, value );
  }

}
