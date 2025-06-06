import { Component, inject } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MATERIAL } from '../../../material';

@Component({
  standalone: true,
  selector: 'home-page',
  imports: [CommonModule, MATERIAL],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {

  public authService = inject( AuthService )


}
