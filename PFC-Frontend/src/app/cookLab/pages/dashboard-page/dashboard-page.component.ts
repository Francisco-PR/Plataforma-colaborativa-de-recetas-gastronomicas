import { CommonModule, DOCUMENT, ViewportScroller } from '@angular/common';
import { AfterViewInit, Component, computed, effect, ElementRef, inject, OnInit, Renderer2, signal, ViewChild } from '@angular/core';
import { MATERIAL } from '../../../material';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PaginationInfo } from '../../interfaces/paginationInfo.interface';
import { User } from '../../../auth/interfaces/user.interface';
import { AdminService } from '../../services/admin.service';
import { UserFilter } from '../../interfaces/filter.interface';
import { debounceTime } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, MATERIAL, ReactiveFormsModule],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css'
})
export class DashboardPageComponent implements OnInit {


  private adminService = inject( AdminService )
  private fb = inject( FormBuilder );
  private scroller = inject( ViewportScroller )

  public defaulPagination: PaginationInfo = {
    totalCount: 0,
    totalPages: 0,
    currentPage: 0
  }

  public users = signal<User[]>([]);
  public usersPagination = signal<PaginationInfo>( this.defaulPagination );

   public filterForm: FormGroup = this.fb.group({
    username: [''],
    isBanned: [false],
  });

  public filter = signal<UserFilter>({
    username: '',
    isBanned: false
  });

  public queryString = computed(() => {
    const f = this.filter();
    const params = new URLSearchParams();

    if (f.username.trim()) params.set('username', f.username);
    if (f.isBanned) params.set('isbanned',  JSON.stringify(f.isBanned) );

    return '?' + params.toString();
  });

  constructor() {
    effect(() => {
          const query = this.queryString();
          this.getFilteredUsers(query);
        });
  }


  ngOnInit(): void {
    // Sincronizar formulario con filtro reactivo
    this.filterForm.valueChanges
      .pipe(
        debounceTime(500)
      )
      .subscribe(formValue => {
        this.filter.set({
          username: formValue.username,
          isBanned: formValue.isBanned
        });
      });

  }

  public getFilteredUsers(  query: string, page: number = 1 ) {
    this.adminService.getFilteredUsers( query, page )
    .subscribe({
      next: ({ totalCount, totalPages, currentPage, resp }) => {
        this.users.set(resp)
        this.usersPagination.set({ totalCount, totalPages, currentPage });
      },
      error: err => {
        this.users.set([]);
        this.usersPagination.set(this.defaulPagination);
        console.error('Error al cargar los usuario', err);
      }
    })

  }

    // Necesitarás MatDialog si usas confirmación con un diálogo
  confirmDeleteUser(userId: string) {
    const confirmed = confirm('¿Estás seguro de eliminar este usuario?');
    if (!confirmed) return;

    this.adminService.deleteUser(userId).subscribe({
      next: () => this.refresh(),
      error: err => console.error('Error al eliminar usuario', err)
    });
  }

  confirmUnbanUser(userId: string) {
    const confirmed = confirm('¿Estás seguro de desbanear este usuario?');
    if (!confirmed) return;

    this.adminService.unBanUser(userId).subscribe({
      next: () => this.refresh(),
      error: err => console.error('Error al desbanear usuario', err)
    });
  }

  confirmBanUser(userId: string, duration: '1h' | '1d' | '3d') {
    const confirmed = confirm(`¿Estás seguro de banear a este usuario durante ${duration}?`);
    if (!confirmed) return;

    const bannedUntil = this.getBanUntil(duration);
    this.adminService.banUser(userId, bannedUntil).subscribe({
      next: () => this.refresh(),
      error: err => console.error('Error al banear usuario', err)
    });
  }

  // Helper para calcular fecha futura
  private getBanUntil(duration: '1h' | '1d' | '3d'): string {
    const now = new Date();
    switch (duration) {
      case '1h': now.setHours(now.getHours() + 1); break;
      case '1d': now.setDate(now.getDate() + 1); break;
      case '3d': now.setDate(now.getDate() + 3); break;
    }
    return now.toISOString();
  }

  public onPageChange(event: PageEvent): void {
    this.scrollUp();
    this.getFilteredUsers(this.queryString(), event.pageIndex + 1);
  }

  public scrollUp(): void {
    this.scroller.scrollToPosition([0, 0])
  }

  private refresh() {
    const page = this.usersPagination().currentPage;
    this.getFilteredUsers(this.queryString(), page);
  }


}
