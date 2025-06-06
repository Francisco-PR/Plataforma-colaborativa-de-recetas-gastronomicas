import { Component, inject } from '@angular/core';
import { MATERIAL } from '../../../material';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { ValidatorsService } from '../../../../shared/services/validators.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: true,
  selector: 'login-page',
  imports: [CommonModule, MATERIAL, ReactiveFormsModule, RouterLink],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  private fb = inject( FormBuilder );
  private authService = inject( AuthService );
  private validatorsService = inject( ValidatorsService );
  private snackBar = inject( MatSnackBar );

  public loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(this.validatorsService.emailPattern)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  login() {
    if (this.loginForm.invalid) return;
    const { email, password } = this.loginForm.value;

    this.authService.login(email!, password!).subscribe({
      error: () => this.loginError()
    });
  }

  public isValidField( field: string) {
    return this.validatorsService.isValidField( this.loginForm, field);
  }

  private loginError():void {
    this.loginForm.reset()
    const message: string = 'Usuario o contraseña incorrectos'
    this.snackBar.open( message, 'OK',{ duration:4000 })
  }
}
