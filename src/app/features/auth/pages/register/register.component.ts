import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router'; // Router import et
import { AuthService } from '../../../../core/services/auth.service'; // AuthService import et
import { ToastrService } from 'ngx-toastr'; // ToastrService import et

export const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  /* ... önceki kod ... */ const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  if (
    !password ||
    !confirmPassword ||
    !password.value ||
    !confirmPassword.value
  ) {
    return null;
  }
  return password.value === confirmPassword.value
    ? null
    : { passwordMismatch: true };
};

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: false,
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isSubmitting: boolean = false; // Gönderim durumunu takip etmek için

  constructor(
    private fb: FormBuilder,
    private authService: AuthService, // Inject AuthService
    private router: Router, // Inject Router
    private toastr: ToastrService // Inject ToastrService
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordMatchValidator }
    );
  }

  onSubmit(): void {
    if (this.registerForm.invalid || this.isSubmitting) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    // Gerçek uygulamada önce authService.register(formData) çağrılır.
    // Başarılı olursa, DÖNEN YANITA GÖRE veya ayrıca authService.login() çağrılabilir.
    // Mock senaryoda, direkt login'i çağırarak otomatik giriş simüle edelim.
    const { confirmPassword, ...formData } = this.registerForm.value; // confirmPassword'ı ayıkla
    console.log('Simulating registration and login with:', formData);

    this.authService.login(formData).subscribe({
      // Login'i çağırıyoruz (mock)
      next: (success) => {
        if (success) {
          this.toastr.success(
            'Registration successful! You are now logged in.',
            'Welcome'
          );
          this.router.navigate(['/']); // Başarılı girişte ana sayfaya yönlendir
        } else {
          this.toastr.error(
            'Registration succeeded but login failed.',
            'Warning'
          );
          this.isSubmitting = false;
        }
      },
      error: (err) => {
        console.error('Registration/Login error:', err);
        this.toastr.error(
          err.message || 'An unexpected error occurred during registration.',
          'Registration Failed'
        );
        this.isSubmitting = false;
      },
    });
  }

  get email() {
    return this.registerForm.get('email');
  }
  get password() {
    return this.registerForm.get('password');
  }
  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }
}
