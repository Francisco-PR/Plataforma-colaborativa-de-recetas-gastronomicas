import { Routes } from "@angular/router";
import { CookLabLayoutComponent } from "./layout/cook-lab-layout.component";
import { HomePageComponent } from "./pages/home-page/home-page.component";
import { SearchPageComponent } from "./pages/search-page/search-page.component";
import { RecipePageComponent } from "./pages/recipe-page/recipe-page.component";
import { ProfilePageComponent } from "./pages/profile-page/profile-page.component";
import { isAuthenticatedGuard } from "../auth/guards/is-authenticated.guard";
import { CreateUpdateRecipePageComponent } from "./pages/create-update-recipe-page/create-update-recipe-page.component";
import { DashboardPageComponent } from "./pages/dashboard-page/dashboard-page.component";
import { isAdminGuard } from "../auth/guards/is-admin.guard";



const authRoutes: Routes = [
  {
    path: '',
    component: CookLabLayoutComponent,
    children: [
      { path: 'home', component: HomePageComponent },
      { path: 'search', component: SearchPageComponent },
      { path: 'profile', component: ProfilePageComponent, canActivate: [ isAuthenticatedGuard ],},
      { path: 'dashboard', component: DashboardPageComponent, canActivate: [ isAuthenticatedGuard, isAdminGuard ],},
      { path: 'create-recipe', component: CreateUpdateRecipePageComponent, canActivate: [ isAuthenticatedGuard ],},
      { path: 'update-recipe/:id', component: CreateUpdateRecipePageComponent, canActivate: [ isAuthenticatedGuard ],},
      { path: 'recipe/:id', component: RecipePageComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full'},
      { path: '**', redirectTo: 'home'},
    ]
  },
];

export default authRoutes;
