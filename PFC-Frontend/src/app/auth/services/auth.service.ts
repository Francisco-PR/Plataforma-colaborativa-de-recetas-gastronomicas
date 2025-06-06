// src/app/auth/services/auth.service.ts
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Router } from '@angular/router';
import { AuthResponse } from '../interfaces/auth_response.interface';
import { environment } from '../../../environments/environments';
import { AuthStatus } from '../interfaces/auth-status.enum';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { User } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject ( Router );

  private readonly BASE_URL: string = environment.baseUrl;

  private _currentUser = signal<User|null>(null);
  private _authStatus = signal<AuthStatus>( AuthStatus.checking );

  public currentUser = computed( () => this._currentUser() )
  public isAdmin = computed( () => this._currentUser()?.roles.includes('Admin'))
  public authStatus = computed( () => this._authStatus() )

  constructor() {
    this.checkAuthStatus().subscribe();
  }

  private setAuthentication( user: User, token: string ): boolean {
    this._currentUser.set( user );
    this._authStatus.set( AuthStatus.authenticated )
    localStorage.setItem('token', token);
    return true
  }

  login( email: string, password: string ): Observable<boolean> {
    const url = `${ this.BASE_URL }/auth/login`
    const body = { email, password };

    return this.http.post<AuthResponse>( url, body )
      .pipe(
        map( ({ user, token }) => this.setAuthentication( user, token )),
        catchError( error => throwError( () => error.error.message
        ) )
      )
  }

  register( username: string, email: string, password: string ): Observable<boolean> {
    const url = `${ this.BASE_URL }/auth/register`
    const body = {username, email, password };

    return this.http.post<AuthResponse>( url, body )
      .pipe(
        map( ({ user, token }) => this.setAuthentication( user, token )),
        catchError( error => throwError( () => error.error.message
        ) )
      )
  }

    private get headers() {
    const token = localStorage.getItem('token');
    if ( !token ) new HttpHeaders();

    return new HttpHeaders().set( 'Authorization', `Bearer ${ token }` )
  }

  //TODO Implementar
  public deleteUser() {
    const url = `${ this.BASE_URL }/users`;
    const token = localStorage.getItem('token');

    if ( !token ) this.logout();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${ token }`)

    return this.http.delete(url, { headers })
  }


  checkAuthStatus(): Observable<boolean> {
    const url = `${ this.BASE_URL  }/auth/check-token`;
    const token = localStorage.getItem('token');

    if ( !token ) {
      this.logout()
      return of(false);
    }

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${ token }`)

      return this.http.get<AuthResponse>(url, { headers })
        .pipe(
          map( ({ user, token }) => this.setAuthentication( user, token )),
          catchError(() => {
            this._authStatus.set( AuthStatus.notAuthenticated )
            return of(false)
            }),
        )
  }

  logout() {
    localStorage.removeItem('token')
    this._currentUser.set( null );
    this._authStatus.set( AuthStatus.notAuthenticated );

  }

  public authStatusChangeEffect = effect(() => {
    switch( this.authStatus() ) {

      case AuthStatus.checking:
      return;

      case AuthStatus.authenticated:
        const prevUrl = localStorage.getItem('url');
        this.router.navigateByUrl( 'cookLab/home' );
        /* this.router.navigateByUrl( '' ) */
      return;

      case AuthStatus.notAuthenticated:
      return;
    }
   })
}
