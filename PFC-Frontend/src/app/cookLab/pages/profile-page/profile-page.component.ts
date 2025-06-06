import { Component, inject, OnInit, signal } from '@angular/core';
import { RecipesService } from '../../services/recipes.service';
import { Recipe } from '../../interfaces/recipe.interface';
import { PaginationInfo } from '../../interfaces/paginationInfo.interface';
import { AuthService } from '../../../auth/services/auth.service';
import { CommonModule } from '@angular/common';
import { MATERIAL } from '../../../material';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'profile-page',
  imports: [CommonModule, MATERIAL, RouterLink],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent implements OnInit{

  private recipesService = inject( RecipesService );
  private authService = inject( AuthService )

  public defaulPagination: PaginationInfo = {
    totalCount: 0,
    totalPages: 0,
    currentPage: 0
  }

  public userRecipes = signal<Recipe[]>([]);
  public userRecipesPagination = signal<PaginationInfo>( this.defaulPagination );

  public userFavoriteRecipes = signal<Recipe[]>([]);
  public favoriteRecipesPagination = signal<PaginationInfo>( this.defaulPagination );


  ngOnInit(): void {
    this.getUserRecipes()
    this.getUserFavoriteRecipes()
  }

  public getUserRecipes( page: number = 1 ) {
    const userId = this.authService.currentUser()!._id
    this.recipesService.getUserRecipes( userId, page)
    .subscribe({
      next: ({ totalCount, totalPages, currentPage, resp }) => {
        this.userRecipes.set(resp)
        this.userRecipesPagination.set({ totalCount, totalPages, currentPage });
      },
      error: err => {
        this.userRecipes.set([]);
        this.userRecipesPagination.set(this.defaulPagination);
        console.error('Error al cargar recetas del usuario', err);
      }
    })

  }

  public getUserFavoriteRecipes( page: number = 1 ) {
    this.recipesService.getUserFavoriteRecipes( page )
      .subscribe({
        next: ({ totalCount, totalPages, currentPage, resp }) => {
          this.userFavoriteRecipes.set(resp)
          this.favoriteRecipesPagination.set({ totalCount, totalPages, currentPage });
        },
        error: err => {
          this.userFavoriteRecipes.set([]);
          this.favoriteRecipesPagination.set(this.defaulPagination);
          console.error('Error al cargar recetas favoritas', err);
        }
      })
  }

  confirmDeleteRecipe(recipeId: string) {
    const confirmed = confirm('¿Estás seguro de eliminar esta receta?');
    if (!confirmed) return;

    this.recipesService.deleteRecipe(recipeId).subscribe({
      next: () => this.getUserRecipes(),
      error: err => console.error('Error al eliminar la receta', err)
    });
  }

  confirmRemoveRecipeFromFavorites(recipeId: string) {
    const confirmed = confirm('¿Estás seguro de eliminar esta receta de favoritos?');
    if (!confirmed) return;

    this.recipesService.removeRecipeFromFavorites(recipeId).subscribe({
      next: () => this.getUserFavoriteRecipes(),
      error: err => console.error('Error al eliminar la receta de favoritos', err)
    });
  }


  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/recipes-default.jpg';
  }

}
