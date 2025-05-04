import { Component, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

// passwordMatchValidator
export const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const password = control.get('password');
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
  isSubmitting: boolean = false;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        // username kontrolü eklendi
        username: ['', [Validators.required, Validators.minLength(3)]],
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
    // formData artık username'i de içeriyor
    const { confirmPassword, ...formData } = this.registerForm.value;

    this.authService.register(formData).subscribe({
      next: (createdUser) => {
        this.isSubmitting = false;
        this.toastr.success(
          `Registration successful for ${createdUser.email}! Please log in.`,
          'Account Created'
        );
        this.router.navigate(['/auth/login']); // Kayıt sonrası login sayfasına yönlendir
      },
      error: (err) => {
        console.error('Registration error in component:', err);
        // AuthService'den gelen hata mesajını kullan
        this.toastr.error(
          err.message || 'Registration failed. Please try again.',
          'Registration Failed'
        );
        this.isSubmitting = false;
      },
    });
  }

  // Getter'lar (username için de eklendi)
  get email() {
    return this.registerForm.get('email');
  }
  get username() {
    return this.registerForm.get('username');
  } // Eklendi
  get password() {
    return this.registerForm.get('password');
  }
  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }
}
