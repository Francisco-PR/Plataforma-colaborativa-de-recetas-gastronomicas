import { Component, inject, OnInit } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterLink, RouterOutlet } from '@angular/router';
import { MATERIAL } from '../../material';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  standalone: true,
  selector: 'auth-layout',
  imports: [CommonModule, MATERIAL, RouterOutlet, RouterLink],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.css'
})
export class AuthLayoutComponent implements OnInit {

  private router = inject( Router );

  public isLogin: boolean = true;

  ngOnInit(): void {
    this.isLogin = this.router.url.includes('/login')
    this.router.events
      .pipe(
        filter( event => event instanceof NavigationStart )
      )
      .subscribe( () => this.isLogin = !this.router.url.includes('/login') );
  }

}
