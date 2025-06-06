export interface RecipesResp {
  totalCount:  number;
  totalPages:  number;
  currentPage: number;
  resp:        Recipe[];
}

export interface Recipe {
  categories:       string[];
  _id:              string;
  title:            string;
  description:      string;
  ingredients:      string[];
  steps:            string[];
  image:            string;
  author:           Author;
  createdAt:        Date;
  updatedAt:        Date;
  __v:              number;
  ratings:          number;
  preparationTime?: number;
}

export interface RecipeDetails {
  _id:             string;
  title:           string;
  description:     string;
  categories:      string[];
  ingredients:     string[];
  steps:           string[];
  preparationTime: number;
  image:           string;
  author:          Author;
  userRating:     UserRating;
  ratings:         number;
  comments:        Comment[];
}

export interface Author {
  _id:      string;
  username: string;
}

export interface Comment {
  _id: string;
  content: string;
  user: UserPreview;
}

export interface UserPreview {
  _id: string;
  username: string;
}

export interface CommentPostBody {
    content: string;
    user: string;
    recipe: string;
}

export interface RecipePostBody {
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  image?: string;
  categories?: RecipeCategories[];
  preparationTime: number;
}

export type PartialRecipePostBody = Partial<RecipePostBody>;

export interface UserRating {
  user: string;
  value: number;
  _id: string;
}

export interface RateRecipeResp {
  message: string;
  averageRating: number;
}

export enum RecipeCategories {
  Desayuno = "Desayuno",
  Almuerzo = "Almuerzo",
  Cena = "Cena",
  Aperitivos = "Aperitivos",
  Postres = "Postres",
  Bebidas = "Bebidas"
}
