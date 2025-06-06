import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';
import { UsersResp } from '../../auth/interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private http = inject( HttpClient );

  private readonly BASE_URL: string = environment.baseUrl;

  constructor() { }

  private get headers() {
    const token = localStorage.getItem('token');
    if ( !token ) new HttpHeaders();

    return new HttpHeaders().set( 'Authorization', `Bearer ${ token }` )
  }

  public getFilteredUsers( queryString: string, page: number ) {
    const url = `${ this.BASE_URL }/users${ queryString }&page=${ page }`;
    return this.http.get<UsersResp>( url, { headers: this.headers } )
  }

  public deleteUser( userId: string ) {
    const url = `${ this.BASE_URL }/users/${ userId }`;
    return this.http.delete( url, { headers: this.headers } )
  }

  public banUser( userId: string, bannedUntil: string ) {
    const url = `${ this.BASE_URL }/users/${ userId }/ban`;
    return this.http.patch( url, { bannedUntil }, { headers: this.headers } )
  }

  public unBanUser( userId: string ) {
    const url = `${ this.BASE_URL }/users/${ userId }/unban`;
    return this.http.patch(url, {}, { headers: this.headers } )
  }

}
