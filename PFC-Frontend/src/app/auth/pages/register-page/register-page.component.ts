import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MATERIAL } from '../../../material';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import { ValidatorsService } from '../../../../shared/services/validators.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: true,
  selector: 'register-page',
  imports: [CommonModule, MATERIAL, ReactiveFormsModule, RouterLink],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css'
})
export class RegisterPageComponent {
  private fb = inject( FormBuilder );
  private authService = inject( AuthService );
  private validatorsService = inject( ValidatorsService )
  private snackBar = inject( MatSnackBar )

  public registerForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.pattern(this.validatorsService.emailPattern)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    password2: ['', [Validators.required, Validators.minLength(6)]],
  },
  {
    validators:[
      this.validatorsService.isFieldOneEqualsFieldTwo('password', 'password2')
    ]
  });

  register() {
    if (this.registerForm.invalid) return;
    const { username, email, password } = this.registerForm.value;

    this.authService.register(username!, email!, password!).subscribe({
      error: () => this.registerError(),
    });
  }

  public isValidField( field: string) {
    return this.validatorsService.isValidField( this.registerForm, field);
  }

   private registerError():void {
    this.registerForm.reset()
    const message: string = 'El usuario ya existe'
    this.snackBar.open( message, 'OK',{ duration:4000 })
  }
}
