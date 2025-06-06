import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { MATERIAL } from '../../material';
import { CommonModule } from '@angular/common';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { map, Observable } from 'rxjs';

@Component({
  standalone: true,
  selector: 'cookLab-layout',
  imports: [CommonModule, RouterOutlet, MATERIAL, RouterLink],
  templateUrl: './cook-lab-layout.component.html',
  styleUrl: './cook-lab-layout.component.css'
})
export class CookLabLayoutComponent {

  private authService = inject( AuthService )
  private breakpointObserver = inject(BreakpointObserver)

  public isSmallScreen$: Observable<boolean>;

  constructor() {
    this.isSmallScreen$ = this.breakpointObserver
      .observe(['(max-width: 767px)'])
      .pipe(
        map(result => result.matches)
      );
  }

  public sidebarItems = computed(() => {

    let items = [
    { label: 'Home', icon: 'home', url: 'home'},
    { label: 'Recetas', icon: 'search', url: 'search' }
    ]

    if ( this.authService.isAdmin()?.valueOf()) {
      items.push( { label: 'Dashboard', icon: 'view_quilt', url: 'dashboard' } );
    }
    else {
      items.push( { label: 'Perfil', icon: 'person', url: 'profile' } );
    }

    return items
  })

  public logout() {
    this.authService.logout()
  }

  public get user() {
    return this.authService.currentUser()?.username
  }

  public get isAdmin() {
    return  this.authService.isAdmin()
  }

}
