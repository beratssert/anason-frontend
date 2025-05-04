import { Injectable, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError, timer } from 'rxjs';
import { delay, map, tap, catchError, switchMap } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';

// User interface
export interface User {
  id: number;
  username?: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SELLER';
  created_at?: Date | string;
}

// Login Response Interface
interface AuthenticationResponse {
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  private readonly AUTH_TOKEN_KEY = 'anason_auth_token';
  private readonly AUTH_USER_KEY = 'anason_auth_user';
  private apiUrl = environment.apiUrl;

  private currentUserSubject: BehaviorSubject<User | null>;
  private isLoggedInSubject: BehaviorSubject<boolean>;

  public currentUser$: Observable<User | null>;
  public isLoggedIn$: Observable<boolean>;

  private storageEventListener: (event: StorageEvent) => void;
  private httpClient = inject(HttpClient);
  private router = inject(Router);

  constructor() {
    const initialUser = this.loadUserFromStorage();
    const initialToken = this.loadTokenFromStorage();
    this.currentUserSubject = new BehaviorSubject<User | null>(initialUser);
    this.isLoggedInSubject = new BehaviorSubject<boolean>(
      !!initialToken && !!initialUser
    );

    this.currentUser$ = this.currentUserSubject.asObservable();
    this.isLoggedIn$ = this.isLoggedInSubject.asObservable();

    this.storageEventListener = this.handleStorageChange.bind(this);
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.storageEventListener);
    }
    console.log(
      'AuthService Initialized. Initial logged in state:',
      this.isLoggedIn
    );
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.storageEventListener);
    }
  }

  private handleStorageChange(event: StorageEvent): void {
    if (event.key === this.AUTH_TOKEN_KEY || event.key === this.AUTH_USER_KEY) {
      const user = this.loadUserFromStorage();
      const token = this.loadTokenFromStorage();
      const loggedIn = !!token && !!user;

      if (
        JSON.stringify(this.currentUserSubject.value) !== JSON.stringify(user)
      ) {
        this.currentUserSubject.next(user);
      }
      if (this.isLoggedInSubject.value !== loggedIn) {
        this.isLoggedInSubject.next(loggedIn);
      }
    }
  }

  private loadTokenFromStorage(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(this.AUTH_TOKEN_KEY);
    }
    return null;
  }

  private loadUserFromStorage(): User | null {
    if (typeof localStorage !== 'undefined') {
      const storedUser = localStorage.getItem(this.AUTH_USER_KEY);
      const storedToken = localStorage.getItem(this.AUTH_TOKEN_KEY);

      if (storedUser && storedToken) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (
            parsedUser &&
            typeof parsedUser.id === 'number' &&
            typeof parsedUser.email === 'string' &&
            typeof parsedUser.role === 'string'
          ) {
            if (
              parsedUser.created_at &&
              typeof parsedUser.created_at === 'string'
            ) {
              parsedUser.created_at = new Date(parsedUser.created_at);
            }
            return parsedUser as User;
          } else {
            console.warn('Invalid user structure in localStorage.');
            this.clearAuthDataInternal();
            return null;
          }
        } catch (e) {
          console.error('Error parsing user from localStorage', e);
          this.clearAuthDataInternal();
          return null;
        }
      }
    }
    if (this.currentUserSubject?.value || this.isLoggedInSubject?.value) {
      this.clearAuthDataInternal();
    }
    return null;
  }

  private clearAuthDataInternal(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.AUTH_TOKEN_KEY);
      localStorage.removeItem(this.AUTH_USER_KEY);
    }
    if (this.currentUserSubject && this.currentUserSubject.value !== null) {
      this.currentUserSubject.next(null);
    }
    if (this.isLoggedInSubject && this.isLoggedInSubject.value !== false) {
      this.isLoggedInSubject.next(false);
    }
  }

  private storeAuthData(token: string, user: User): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.AUTH_TOKEN_KEY, token);
      const { ...userDataToStore } = user; // Hassas veri olmadan sakla
      localStorage.setItem(this.AUTH_USER_KEY, JSON.stringify(userDataToStore));
    }
    this.currentUserSubject.next(user);
    this.isLoggedInSubject.next(true);
  }

  private decodeToken(token: string): any | null {
    try {
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) return null;
      const payloadJson = atob(
        payloadBase64.replace(/-/g, '+').replace(/_/g, '/')
      ); // Base64 URL safe decode
      return JSON.parse(payloadJson);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  public get isLoggedIn(): boolean {
    return (
      !!this.loadTokenFromStorage() && !!this.currentUserSubject.getValue()
    );
  }

  public get currentUserValue(): User | null {
    return this.isLoggedIn ? this.currentUserSubject.getValue() : null;
  }

  login(credentials: {
    email?: string | null;
    password?: string | null;
  }): Observable<User> {
    const loginUrl = `${this.apiUrl}/users/login`;
    if (!credentials.email || !credentials.password) {
      return throwError(() => new Error('Email and password are required.'));
    }
    const payload = {
      email: credentials.email,
      password: credentials.password,
    };

    return this.httpClient.post<AuthenticationResponse>(loginUrl, payload).pipe(
      switchMap((response) => {
        // switchMap kullanarak token decode işlemini zincire ekle
        console.log('Login successful, response:', response);
        if (response && response.token) {
          const tokenPayload = this.decodeToken(response.token);
          console.log('Decoded token payload:', tokenPayload); // Payload'ı logla
          if (tokenPayload && tokenPayload.sub && tokenPayload.role) {
            // Backend'den user objesi gelmiyorsa, token'dan veya ek bir API çağrısı ile user bilgisi alınmalı.
            // Şimdilik token'dan alıyoruz, AMA ID'yi de almamız lazım.
            // Backend JwtUtil.generateToken içine user ID'yi de eklemeli!
            // Örnek: .claim("userId", user.getId())
            const user: User = {
              id: tokenPayload.userId || 0, // Backend'den userId claim'i gelmeli
              email: tokenPayload.sub,
              role: tokenPayload.role as User['role'],
              username: tokenPayload.username || tokenPayload.sub.split('@')[0], // username claim'i varsa kullan
            };

            this.storeAuthData(response.token, user);
            return of(user); // Başarılı login sonrası User objesini döndür
          } else {
            console.error(
              'Token payload is invalid or missing required claims (sub, role, userId).'
            );
            this.clearAuthDataInternal();
            return throwError(
              () => new Error('Invalid authentication token received.')
            );
          }
        } else {
          console.error('Login response missing token.');
          this.clearAuthDataInternal();
          return throwError(
            () => new Error('Authentication failed: No token received.')
          );
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Login HTTP error:', error);
        this.clearAuthDataInternal();
        let errorMessage = 'Login failed. Please check your credentials.';
        if (error.status === 401) {
          errorMessage = 'Invalid email or password.';
        } else if (error.error && typeof error.error.message === 'string') {
          errorMessage = error.error.message;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  logout(): void {
    console.log('AuthService: Logging out');
    this.clearAuthDataInternal();
    this.router.navigate(['/auth/login']);
  }

  register(userData: any): Observable<User> {
    const registerUrl = `${this.apiUrl}/users/register`;
    // userData objesi artık username'i de içeriyor
    const payload = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
    };

    console.log('Sending registration payload:', payload);

    return this.httpClient
      .post<User>(registerUrl, payload) // Backend'den User objesi dönüyor
      .pipe(
        tap((createdUser) => {
          console.log('Registration successful:', createdUser);
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Registration HTTP error:', error);
          let errorMessage = 'Registration failed. Please try again.';
          if (error.status === 400 && error.error?.message) {
            // Spring Boot validation hatası mesajını yakala
            errorMessage = error.error.message;
          } else if (error.error && typeof error.error === 'string') {
            // Diğer string hatalar
            errorMessage = error.error;
          } else if (
            error.status === 500 &&
            error.error?.message &&
            error.error.message.includes('ConstraintViolationException')
          ) {
            // Unique constraint hatası (daha spesifik kontrol edilebilir)
            if (
              error.error.message.includes('users_username_key') ||
              error.error.message.includes('uk_username')
            ) {
              // Index/Constraint adını kontrol et
              errorMessage = 'Username already exists.';
            } else if (
              error.error.message.includes('users_email_key') ||
              error.error.message.includes('uk_email')
            ) {
              errorMessage = 'Email already in use.';
            } else {
              errorMessage = 'A registration error occurred (Constraint).';
            }
          }
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  public hasRole(expectedRole: 'CUSTOMER' | 'ADMIN' | 'SELLER'): boolean {
    const currentUser = this.currentUserValue;
    return !!currentUser && currentUser.role === expectedRole;
  }

  public getUserRole(): string | null {
    return this.currentUserValue?.role || null;
  }

  public getToken(): string | null {
    return this.loadTokenFromStorage();
  }
}
