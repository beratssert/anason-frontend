import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router'; // Router import et
import { AuthService } from '../../../../core/services/auth.service'; // AuthService import et
import { ToastrService } from 'ngx-toastr'; // ToastrService import et

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false,
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isSubmitting: boolean = false; // Gönderim durumunu takip etmek için

  constructor(
    private fb: FormBuilder,
    private authService: AuthService, // Inject AuthService
    private router: Router, // Inject Router
    private toastr: ToastrService // Inject ToastrService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.isSubmitting) {
      this.loginForm.markAllAsTouched(); // Form geçersizse tüm alanları işaretle
      return;
    }

    this.isSubmitting = true; // Gönderim başladı

    this.authService.login(this.loginForm.value).subscribe({
      next: (success) => {
        if (success) {
          this.toastr.success('Login successful!', 'Welcome Back');
          this.router.navigate(['/']); // Başarılı girişte ana sayfaya yönlendir
        } else {
          // Mock servis hep true dönüyor ama gerçek API'de burası çalışabilir
          this.toastr.error(
            'Login failed. Please check your credentials.',
            'Error'
          );
          this.isSubmitting = false; // Gönderim bitti (hata ile)
        }
        // this.isSubmitting = false; // Başarı durumunda da false'a çekilebilir ama yönlendirme oluyor zaten
      },
      error: (err) => {
        // Gerçek API'den dönebilecek hataları burada yakala
        console.error('Login error:', err);
        this.toastr.error(
          err.message || 'An unexpected error occurred during login.',
          'Login Failed'
        );
        this.isSubmitting = false; // Gönderim bitti (hata ile)
      },
    });
  }

  get email() {
    return this.loginForm.get('email');
  }
  get password() {
    return this.loginForm.get('password');
  }
}
