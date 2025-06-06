import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { RecipesService } from '../../services/recipes.service';
import { Recipe } from '../../interfaces/recipe.interface';
import { RecipeFilter } from '../../interfaces/filter.interface';
import { CommonModule, ViewportScroller } from '@angular/common';
import { MATERIAL } from '../../../material';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { PrepTimeRangePipe } from '../../pipes/prep-time-range.pipe';
import { RouterLink } from '@angular/router';
import { PaginationInfo } from '../../interfaces/paginationInfo.interface';
import { PageEvent } from '@angular/material/paginator';

const CATEGORIES: string[] = ["Desayuno", "Almuerzo", "Cena", "Aperitivos", "Postres", "Bebidas"]

@Component({
  standalone: true,
  selector: 'search-page',
  imports: [CommonModule, MATERIAL, ReactiveFormsModule, PrepTimeRangePipe, RouterLink],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.css'
})
export class SearchPageComponent implements OnInit{

  private recipesService = inject(RecipesService);
  private fb = inject(FormBuilder);
  private scroller = inject( ViewportScroller );

  public defaulPagination: PaginationInfo = {
    totalCount: 0,
    totalPages: 0,
    currentPage: 0
  }

  public readonly categories = CATEGORIES;

  public filterForm: FormGroup = this.fb.group({
    title: [''],
    ingredients: [''],
    minPrepTime: [0],
    maxPrepTime: [720],
    categories: [[]]
  });


  public filter = signal<RecipeFilter>({
    title: '',
    ingredients: '',
    minPrepTime: 0,
    maxPrepTime: 720,
    categories: []
  });

  public recipes = signal<Recipe[]>([]);
  public paginationInfo = signal<PaginationInfo>( this.defaulPagination );

  public queryString = computed(() => {
    const f = this.filter();

    const params = new URLSearchParams();
    if (f.title.trim()) params.set('title', f.title);
    if (f.ingredients.trim()) params.set('ingredients', f.ingredients);
    if (f.minPrepTime >= 0) params.set('minPrepTime', String(f.minPrepTime));
    if (f.maxPrepTime > 0) params.set('maxPrepTime', String(f.maxPrepTime));
    if (f.categories.length > 0) params.set('categories', f.categories.join(','));

    return '?' + params.toString();
  });

  constructor() {
    effect(() => {
      const query = this.queryString();
      this.getFilteredRecipes(query);
    });
  }

  ngOnInit(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(500)
      )
      .subscribe(formValue => {
        this.filter.set({
          title: formValue.title,
          ingredients: formValue.ingredients,
          minPrepTime: formValue.minPrepTime,
          maxPrepTime: formValue.maxPrepTime,
          categories: formValue.categories
        });
      });

  }

  private getFilteredRecipes(filter: string, page: number = 1) {
    this.recipesService.getFilteredRecipes(filter, page)
      .subscribe({
        next: ({ totalCount, totalPages, currentPage, resp }) => {
          this.recipes.set(resp);
          this.paginationInfo.set({totalCount, totalPages, currentPage });
        },
        error: err => {
          this.recipes.set([]);
          this.paginationInfo.set(this.defaulPagination);
          console.error('Error al cargar recetas', err);
        }
      });
  }
  public resetFilter() {
    this.filterForm.reset({
      title: '',
      ingredients: '',
      minPrepTime: 0,
      maxPrepTime: 720,
      categories: []
    })
  }

  public onPageChange(event: PageEvent): void {
    this.scrollUp();
    this.getFilteredRecipes(this.queryString(), event.pageIndex + 1);
  }

  public scrollUp(): void {
    this.scroller.scrollToPosition([0, 0])
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/recipes-default.jpg';
  }
}
