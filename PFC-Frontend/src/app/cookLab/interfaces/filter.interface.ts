export interface RecipeFilter {
  title: string;
  ingredients: string;
  categories: string[];
  maxPrepTime: number;
  minPrepTime: number;
}

export interface UserFilter {
  username: string;
  isBanned: boolean;
}
