export interface UsersResp {
  totalCount:  number;
  totalPages:  number;
  currentPage: number;
  resp:        User[];
}

export interface User {
  _id: string;
  username: string;
  email: string;
  roles: string[];
  favoriteRecipes: string[];
  createdAt: string;
  updatedAt: string;
  bannedUntil: string | null;
  __v: number;
}
