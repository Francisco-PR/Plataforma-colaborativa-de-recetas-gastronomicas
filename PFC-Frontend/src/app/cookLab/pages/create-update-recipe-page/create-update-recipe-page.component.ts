import { Component, inject, OnInit } from '@angular/core';
import { RecipeCategories, RecipePostBody } from '../../interfaces/recipe.interface';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RecipesService } from '../../services/recipes.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MATERIAL } from '../../../material';
import { StepperOrientation } from '@angular/cdk/stepper';
import { map, Observable } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ValidatorsService } from '../../../../shared/services/validators.service';

@Component({
  selector: 'create-update-recipe-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MATERIAL],
  templateUrl: './create-update-recipe-page.component.html',
  styleUrl: './create-update-recipe-page.component.css'
})
export class CreateUpdateRecipePageComponent implements OnInit{

  private fb = inject(FormBuilder);
  private recipesService = inject(RecipesService);
  private validatorsService = inject(ValidatorsService)
  private route = inject(ActivatedRoute);
  private router = inject(Router)
  private snackBar = inject(MatSnackBar)
  private breakpointObserver = inject(BreakpointObserver)

  public categories = Object.values(RecipeCategories);
  public isEditMode = false;
  public recipeId: string | null = null;
  public stepperOrientation: Observable<StepperOrientation>;

  constructor() {
    this.stepperOrientation = this.breakpointObserver
      .observe('(min-width: 920px)')
      .pipe(map(({matches}) => (matches ? 'horizontal' : 'vertical')));
  }

   public form: FormGroup = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      image: [''],
      preparationTime: [ , [Validators.required, Validators.min(1), Validators.max(1440)]],
      categories: [[]],
      ingredients: this.fb.array([this.fb.control('', Validators.required)], Validators.minLength(1)),
      steps: this.fb.array([this.fb.control('', Validators.required)], Validators.minLength(1))
    });

  get ingredients() {
    return this.form.get('ingredients') as FormArray;
  }

  get steps() {
    return this.form.get('steps') as FormArray;
  }

  ngOnInit(): void {
    this.recipeId = this.route.snapshot.paramMap.get('id');
    if (this.recipeId) {
      this.isEditMode = true;
      this.loadRecipeData(this.recipeId);
    }
  }

  private loadRecipeData(id: string) {
    this.recipesService.getRecipeDetails(id).subscribe(recipe => {
      this.form.patchValue({
        title: recipe.title,
        description: recipe.description,
        image: recipe.image,
        preparationTime: recipe.preparationTime,
        categories: recipe.categories
      });

      this.ingredients.clear();
      recipe.ingredients.forEach(ing => this.ingredients.push(this.fb.control(ing, Validators.required)));

      this.steps.clear();
      recipe.steps.forEach(step => this.steps.push(this.fb.control(step, Validators.required)));
    });
  }

  addIngredient() {
    this.ingredients.push(this.fb.control('', Validators.required));
  }

  removeIngredient(index: number) {
    this.ingredients.removeAt(index);
  }

  addStep() {
    this.steps.push(this.fb.control('', Validators.required));
  }

  removeStep(index: number) {
    this.steps.removeAt(index);
  }

  onSubmit() {
    if (this.form.invalid) return;

    const recipeData: RecipePostBody = this.form.value;

    if (this.isEditMode && this.recipeId) {
      this.recipesService.updateRecipe(this.recipeId, { ...recipeData })
        .subscribe({
          next: () => this.router.navigateByUrl('/cookLab/profile'),
          error: () => this.error(),
        });
    } else {
      this.recipesService.addRecipe(recipeData)
        .subscribe({
          next: () => this.router.navigateByUrl('/cookLab/profile'),
          error: () => this.error(),
        });
    }
  }

  private error():void {
    const message: string = 'Título de receta no disponible';
    this.snackBar.open( message, 'OK',{ duration:4000 })
  }

  public isValidField( field: string) {
    return this.validatorsService.isValidField( this.form, field);
  }

}
