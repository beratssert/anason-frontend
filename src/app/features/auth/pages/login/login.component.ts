import { Component, OnInit, inject } from '@angular/core'; // inject eklendi
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false,
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isSubmitting: boolean = false;

  // Servisleri inject ile alalım
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.isSubmitting) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (user) => {
        // Başarılı login'de user objesi dönecek (AuthService'den)
        this.isSubmitting = false; // Bunu hemen başa almak daha iyi olabilir
        this.toastr.success(
          'Login successful!',
          `Welcome Back ${user?.username || ''}`
        );
        // Yönlendirme: Eğer returnUrl varsa oraya, yoksa role göre dashboard'a veya ana sayfaya
        const returnUrl =
          this.router.routerState.snapshot.root.queryParams['returnUrl'] || '/';
        // Rol bazlı yönlendirme eklenebilir
        let navigateTo = returnUrl;
        if (returnUrl === '/') {
          // Eğer default ise role göre yönlendir
          if (user.role === 'ADMIN') navigateTo = '/admin';
          else if (user.role === 'SELLER') navigateTo = '/seller';
          // else CUSTOMER ana sayfada kalır (veya /profile?)
        }
        this.router.navigateByUrl(navigateTo);
      },
      error: (err) => {
        console.error('Login error in component:', err);
        // AuthService'den gelen hata mesajını kullan
        this.toastr.error(
          err.message || 'Login failed. Please check credentials.',
          'Login Failed'
        );
        this.isSubmitting = false;
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
