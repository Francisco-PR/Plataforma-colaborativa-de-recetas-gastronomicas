import { Component, inject, OnInit, signal } from '@angular/core';
import { RecipesService } from '../../services/recipes.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommentPostBody, RecipeDetails } from '../../interfaces/recipe.interface';
import { CommonModule } from '@angular/common';
import { MATERIAL } from '../../../material';
import { PrepTimeRangePipe } from '../../pipes/prep-time-range.pipe';
import { PreparationTimePipe } from '../../pipes/preparationTime.pipe';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../auth/services/auth.service';
import { AdminService } from '../../services/admin.service';

@Component({
  standalone: true,
  selector: 'recipe-page',
  imports: [CommonModule, MATERIAL, PreparationTimePipe, ReactiveFormsModule, RouterLink],
  templateUrl: './recipe-page.component.html',
  styleUrl: './recipe-page.component.css'
})
export class RecipePageComponent implements OnInit {

  private recipesService = inject(RecipesService);
  private authService = inject(AuthService);
  private adminService = inject(AdminService)

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  public recipe = signal<RecipeDetails | null>(null);
  public userRating = signal<number | undefined>(undefined);
  public isFavorite = signal<boolean>(false);

  public get user() {
    return this.authService.currentUser()
  }

  public get isAdmin() { return  this.authService.isAdmin() }

  private get recipeId() {
    return this.route.snapshot.paramMap.get('id');
  }

  public commentForm: FormGroup = this.fb.group({
    content: ['', [Validators.minLength(2)]],
  });

  public ratingForm: FormGroup = this.fb.group({
    value: [0, [Validators.required, Validators.min(0.5), Validators.max(5)]]
  });

  ngOnInit(): void {
    if( !this.recipeId ) return
    this.getRecipeDetails( this.recipeId );
    this.isRecipeFavorite( this.recipeId );
  }

  private getRecipeDetails( id: string ) {
    this.recipesService.getRecipeDetails(id, this.user?._id)
      .subscribe({
        next: (recipeDetail) => {
          this.recipe.set(recipeDetail);
          this.userRating.set(recipeDetail.userRating?.value)
        },
        error: err => {
          console.error('Error cargando receta:', err);
          this.recipe.set(null);
        }
      });
  }

  private isRecipeFavorite( recipeId: string ) {
    if (this.user && this.recipeId) {
      this.recipesService.isRecipeFavorite( recipeId )
        .subscribe({
          next: ({ isFavorite }) => this.isFavorite.set(isFavorite),
          error: err => console.error('Error al verificar favorito', err)
        });
    }
  }

  onSubmitComment() {
    if (!this.user || !this.recipeId || !this.commentForm.value.content) return;

    const comment: CommentPostBody = {
      content: this.commentForm.value.content,
      user: this.user._id,
      recipe: this.recipeId
    };

    this.recipesService.addComment(comment).subscribe(() => {
      this.updateComments()
      this.commentForm.reset({content: ''});
    });
  }

  onDeleteComment(commentId: string) {
    if (!confirm('¿Estás seguro de que deseas eliminar este comentario?')) return;

    this.recipesService.deleteComment(commentId).subscribe({
      next: () => this.updateComments(),
      error: err => console.error('Error al eliminar comentario', err),
    });
  }
  private updateComments() {
    this.recipesService.getCommentsByRecipeId( this.recipe()!._id )
      .subscribe(comments => {
        this.recipe()!.comments = comments
      })
  }

  onRateRecipe(rateValue: number) {
    if (!this.user || !this.recipeId) return;

    this.recipesService.rateRecipeByRecipeId( this.recipeId, rateValue ).subscribe({
      next: ({ averageRating }) => {
        this.recipe()!.ratings = averageRating;
        this.userRating.set(rateValue)
      },
      error: err => console.error('Error al valorar receta', err)
    });
  }

  toggleFavorite() {
    if (!this.user || !this.recipeId) return;

    const action = this.isFavorite() ? this.recipesService.removeRecipeFromFavorites : this.recipesService.addRecipeToFavorites;

    action.call(this.recipesService, this.recipeId).subscribe({
      next: () => this.isFavorite.update(v => !v),
      error: err => console.error('Error al cambiar favorito', err)
    });
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/recipes-default.jpg';
  }

  //ADMIN
  confirmDeleteRecipe(recipeId: string) {
    const confirmed = confirm('¿Estás seguro de eliminar esta receta?');
    if (!confirmed) return;

    this.recipesService.deleteRecipe(recipeId).subscribe({
      next: () => this.router.navigateByUrl('/cookLab/search'),
      error: err => console.error('Error al eliminar la receta', err)
    });
  }

  confirmUnbanUser(userId: string) {
    const confirmed = confirm('¿Estás seguro de desbanear este usuario?');
    if (!confirmed) return;

    this.adminService.unBanUser(userId).subscribe({
      error: err => console.error('Error al desbanear usuario', err)
    });
  }

  confirmBanUser(userId: string, duration: '1h' | '1d' | '3d') {
    const confirmed = confirm(`¿Estás seguro de banear a este usuario durante ${duration}?`);
    if (!confirmed) return;

    const bannedUntil = this.getBanUntil(duration);
    this.adminService.banUser(userId, bannedUntil).subscribe({
      error: err => console.error('Error al banear usuario', err)
    });
  }

  private getBanUntil(duration: '1h' | '1d' | '3d'): string {
    const now = new Date();
    switch (duration) {
      case '1h': now.setHours(now.getHours() + 1); break;
      case '1d': now.setDate(now.getDate() + 1); break;
      case '3d': now.setDate(now.getDate() + 3); break;
    }
    return now.toISOString();
  }


}
