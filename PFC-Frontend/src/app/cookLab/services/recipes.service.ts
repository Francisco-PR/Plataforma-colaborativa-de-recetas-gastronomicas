import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';
import { Comment, CommentPostBody, PartialRecipePostBody, RateRecipeResp, RecipeDetails, RecipePostBody, RecipesResp } from '../interfaces/recipe.interface';

@Injectable({
  providedIn: 'root'
})
export class RecipesService {
  private http = inject( HttpClient );

  private readonly BASE_URL: string = environment.baseUrl;

  constructor() { }

  private get headers() {
    const token = localStorage.getItem('token');
    if ( !token ) new HttpHeaders();

    return new HttpHeaders().set( 'Authorization', `Bearer ${ token }` )
  }

  public getFilteredRecipes( queryString: string, page: number  ) {
    const url = `${ this.BASE_URL }/recipes${ queryString }&page=${ page }&limit=6`;
    return this.http.get<RecipesResp>( url );
  }

  public getRecipeDetails( recipeId: string, userId?: string ) {
    let url = `${this.BASE_URL}/recipes/${ recipeId }`;
    if ( userId ) url += `/?user=${ userId }`;
    return this.http.get<RecipeDetails>( url );
  }

  public addRecipe( body: RecipePostBody ) {
    let url = `${this.BASE_URL}/recipes`;
    return this.http.post( url, body,  { headers: this.headers } )
  }

  public deleteRecipe( recipeId: string ) {
    const url = `${ this.BASE_URL }/recipes/${ recipeId }`;
    return this.http.delete( url, { headers: this.headers } )
  }

  public updateRecipe( recipeId: string, body: PartialRecipePostBody ) {
    let url = `${this.BASE_URL}/recipes/${ recipeId }`;
    return this.http.patch( url, body,  { headers: this.headers } )
  }

  public getCommentsByRecipeId( recipeId: string ) {
    const url = `${ this.BASE_URL }/comments/${ recipeId }`;
    return this.http.get<Comment[]>( url );
  }

  public addComment( comment: CommentPostBody ) {
    const { content , recipe } = comment;
    const url = `${ this.BASE_URL }/comments`;
    return this.http.post( url, {content, recipe}, { headers: this.headers } );
  }

  public deleteComment( commentId: string ) {
    const url = `${ this.BASE_URL }/comments/${ commentId }`;
    return this.http.delete( url, { headers: this.headers }  );
  }

  public rateRecipeByRecipeId( recipeId: string, value: number ) {
    const url = `${ this.BASE_URL }/recipes/${ recipeId }/rate`;
    return this.http.post<RateRecipeResp>( url, { value } ,{ headers: this.headers } );
  }

  public getUserRecipes( userId: string, page: number ) {
    const url = `${ this.BASE_URL }/recipes/?author=${ userId }&page=${ page }&limit=3`;
    return this.http.get<RecipesResp>( url );
  }

  public getUserFavoriteRecipes( page: number = 1 ) {
    const url = `${ this.BASE_URL }/favorites/?page=${ page }`;
    return this.http.get<RecipesResp>( url, { headers: this.headers } );
  }

  public addRecipeToFavorites( recipeId: string ) {
    const url = `${ this.BASE_URL }/favorites/${ recipeId }`;
    return this.http.post( url, null, { headers: this.headers } );
  }

  public removeRecipeFromFavorites( recipeId: string ) {
    const url = `${ this.BASE_URL }/favorites/${ recipeId }`;
    return this.http.delete( url, { headers: this.headers } );
  }

  public isRecipeFavorite( recipeId: string ) {
    const url = `${ this.BASE_URL }/favorites/${ recipeId }`;
    return this.http.get<{ isFavorite: boolean }>( url, { headers: this.headers } );
  }

}




