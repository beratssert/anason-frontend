import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError, timer } from 'rxjs';
import { delay, map, tap, catchError, switchMap } from 'rxjs/operators';

// User interface GÜNCELLENDİ (created_at? eklendi)
export interface User {
  id: number;
  username?: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SELLER';
  created_at?: Date | string; // Kayıt tarihi eklendi (opsiyonel)
}

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  private readonly AUTH_STATUS_KEY = 'anason_auth_status';
  private readonly AUTH_USER_KEY = 'anason_auth_user';

  // Mock Kullanıcılar GÜNCELLENDİ (created_at eklendi)
  private mockUsers = [
    {
      id: 1,
      email: 'customer@example.com',
      password: 'password',
      role: 'CUSTOMER' as const,
      username: 'Cust Omer',
      created_at: new Date('2024-01-15T10:00:00Z'),
    },
    {
      id: 2,
      email: 'seller@example.com',
      password: 'password',
      role: 'SELLER' as const,
      username: 'Sell Er',
      created_at: new Date('2024-02-20T11:30:00Z'),
    },
    {
      id: 3,
      email: 'admin@example.com',
      password: 'password',
      role: 'ADMIN' as const,
      username: 'Admin İstrator',
      created_at: new Date('2023-12-01T09:00:00Z'),
    },
  ];

  private currentUserSubject: BehaviorSubject<User | null>;
  private isLoggedInSubject: BehaviorSubject<boolean>;

  public currentUser$: Observable<User | null>;
  public isLoggedIn$: Observable<boolean>;

  private storageEventListener: (event: StorageEvent) => void;

  constructor(private router: Router) {
    const initialUser = this.loadUserFromStorage();
    this.currentUserSubject = new BehaviorSubject<User | null>(initialUser);
    this.isLoggedInSubject = new BehaviorSubject<boolean>(!!initialUser);

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
    if (
      event.key === this.AUTH_STATUS_KEY ||
      event.key === this.AUTH_USER_KEY
    ) {
      const user = this.loadUserFromStorage();
      if (
        JSON.stringify(this.currentUserSubject.value) !== JSON.stringify(user)
      ) {
        this.currentUserSubject.next(user);
      }
      if (this.isLoggedInSubject.value !== !!user) {
        this.isLoggedInSubject.next(!!user);
      }
    }
  }

  private loadUserFromStorage(): User | null {
    if (typeof localStorage !== 'undefined') {
      const storedUser = localStorage.getItem(this.AUTH_USER_KEY);
      const storedStatus = localStorage.getItem(this.AUTH_STATUS_KEY);

      if (storedUser && storedStatus === 'true') {
        try {
          const parsedUser = JSON.parse(storedUser);
          // User interface'ine uygunluğunu kontrol et (created_at dahil)
          if (
            parsedUser &&
            typeof parsedUser.id === 'number' &&
            typeof parsedUser.email === 'string' &&
            typeof parsedUser.role === 'string'
          ) {
            // Tarihi string ise Date objesine çevir (opsiyonel, ama DatePipe için daha iyi)
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
    // localStorage'da veri yoksa veya status 'true' değilse temizle
    if (this.currentUserSubject?.value || this.isLoggedInSubject?.value) {
      this.clearAuthDataInternal();
    }
    return null;
  }

  private clearAuthDataInternal(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.AUTH_STATUS_KEY);
      localStorage.removeItem(this.AUTH_USER_KEY);
    }
    if (this.currentUserSubject && this.currentUserSubject.value !== null) {
      this.currentUserSubject.next(null);
    }
    if (this.isLoggedInSubject && this.isLoggedInSubject.value !== false) {
      this.isLoggedInSubject.next(false);
    }
  }

  private storeAuthData(user: User): void {
    // mockUsers dizisinden tam kullanıcı objesini bul (şifre dahil olabilir)
    const userWithPass = this.mockUsers.find((u) => u.id === user.id);
    if (!userWithPass) return; // Kullanıcı bulunamazsa (teorik olarak olmamalı)

    const { password, ...userDataToStore } = userWithPass; // Şifreyi ayıkla

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.AUTH_STATUS_KEY, 'true');
      localStorage.setItem(this.AUTH_USER_KEY, JSON.stringify(userDataToStore));
    }
    this.currentUserSubject.next(userDataToStore as User);
    this.isLoggedInSubject.next(true);
  }

  public get isLoggedIn(): boolean {
    return this.isLoggedInSubject.getValue();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.getValue();
  }

  login(credentials: {
    email?: string | null;
    password?: string | null;
  }): Observable<User> {
    console.log('AuthService: Attempting login with', credentials);
    const email = credentials?.email;
    const password = credentials?.password;

    if (!email || !password) {
      return throwError(() => new Error('Email and password are required.'));
    }

    const foundUser = this.mockUsers.find(
      (user) => user.email === email && user.password === password
    );

    return timer(500).pipe(
      switchMap(() => {
        if (foundUser) {
          console.log(
            'AuthService: Mock login successful for:',
            foundUser.email,
            'Role:',
            foundUser.role
          );
          this.storeAuthData(foundUser as User);
          const { password, ...userToReturn } = foundUser;
          return of(userToReturn as User);
        } else {
          console.log('AuthService: Mock login failed for:', email);
          this.clearAuthDataInternal();
          return throwError(() => new Error('Invalid email or password.'));
        }
      }),
      catchError((err) => {
        console.error('Login pipe error:', err.message);
        this.clearAuthDataInternal();
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    console.log('AuthService: Logging out');
    this.clearAuthDataInternal();
    this.router.navigate(['/auth/login']);
  }

  hasRole(expectedRole: 'CUSTOMER' | 'ADMIN' | 'SELLER'): boolean {
    const currentUser = this.currentUserValue;
    return !!currentUser && currentUser.role === expectedRole;
  }

  getUserRole(): string | null {
    return this.currentUserValue?.role || null;
  }

  // register(userData: any): Observable<User | null> { ... }
}
