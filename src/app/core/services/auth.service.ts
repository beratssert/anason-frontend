import { Injectable, OnDestroy } from '@angular/core'; // OnDestroy eklendi
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError, timer } from 'rxjs';
import { delay, map, tap, catchError, switchMap } from 'rxjs/operators';

// Kullanıcı interface'i
export interface User {
  id: number;
  username?: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SELLER';
}

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  // OnDestroy implement edildi

  private readonly AUTH_STATUS_KEY = 'anason_auth_status';
  private readonly AUTH_USER_KEY = 'anason_auth_user';

  // Mock Kullanıcılar (Şifreler açık metin - SADECE MOCK İÇİN!)
  private mockUsers = [
    {
      id: 1,
      email: 'customer@example.com',
      password: 'password',
      role: 'CUSTOMER' as const,
      username: 'Cust Omer',
    },
    {
      id: 2,
      email: 'seller@example.com',
      password: 'password',
      role: 'SELLER' as const,
      username: 'Sell Er',
    },
    {
      id: 3,
      email: 'admin@example.com',
      password: 'password',
      role: 'ADMIN' as const,
      username: 'Admin İstrator',
    },
  ];

  private currentUserSubject: BehaviorSubject<User | null>;
  private isLoggedInSubject: BehaviorSubject<boolean>;

  public currentUser$: Observable<User | null>;
  public isLoggedIn$: Observable<boolean>;

  // Storage event listener referansı (kaldırmak için)
  private storageEventListener: (event: StorageEvent) => void;

  constructor(private router: Router) {
    const initialUser = this.loadUserFromStorage();
    this.currentUserSubject = new BehaviorSubject<User | null>(initialUser);
    this.isLoggedInSubject = new BehaviorSubject<boolean>(!!initialUser);

    this.currentUser$ = this.currentUserSubject.asObservable();
    this.isLoggedIn$ = this.isLoggedInSubject.asObservable();

    // Event listener'ı bind et ve referansını sakla
    this.storageEventListener = this.handleStorageChange.bind(this);
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.storageEventListener);
    }
    console.log(
      'AuthService Initialized. Initial logged in state:',
      this.isLoggedIn
    );
  }

  // Component destroy olduğunda listener'ı kaldır
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
      // Değişiklik yoksa gereksiz yayın yapma
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
          // Temel kullanıcı yapısını doğrula (opsiyonel ama daha güvenli)
          if (
            parsedUser &&
            typeof parsedUser.id === 'number' &&
            typeof parsedUser.email === 'string' &&
            typeof parsedUser.role === 'string'
          ) {
            return parsedUser as User;
          } else {
            console.warn('Invalid user structure in localStorage.');
            this.clearAuthDataInternal(); // Hatalıysa temizle (logout çağrılmaz)
            return null;
          }
        } catch (e) {
          console.error('Error parsing user from localStorage', e);
          this.clearAuthDataInternal(); // Hatalıysa temizle
          return null;
        }
      }
    }
    // Eğer localStorage'da geçerli veri yoksa veya status 'true' değilse, temizle
    if (this.currentUserSubject?.value || this.isLoggedInSubject?.value) {
      // Servis init olurken subjects null olabilir
      this.clearAuthDataInternal();
    }
    return null;
  }

  // Sadece localStorage'ı ve Subject'leri temizler, yönlendirme yapmaz
  private clearAuthDataInternal(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.AUTH_STATUS_KEY);
      localStorage.removeItem(this.AUTH_USER_KEY);
    }
    // Subject'lerin varlığını kontrol et (constructor bitmeden çağrılabilir)
    if (this.currentUserSubject && this.currentUserSubject.value !== null) {
      this.currentUserSubject.next(null);
    }
    if (this.isLoggedInSubject && this.isLoggedInSubject.value !== false) {
      this.isLoggedInSubject.next(false);
    }
  }

  // localStorage'a ve Subject'lere veri yazar
  private storeAuthData(user: User): void {
    // Şifreyi asla localStorage'a yazma!
    const { password, ...userDataToStore } = this.mockUsers.find(
      (u) => u.id === user.id
    )!; // Şifreyi tekrar mock listesinden ayıkla

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
    // Başarıda User döndürür
    console.log('AuthService: Attempting login with', credentials);
    const email = credentials?.email;
    const password = credentials?.password;

    if (!email || !password) {
      return throwError(() => new Error('Email and password are required.'));
    }

    const foundUser = this.mockUsers.find(
      (user) => user.email === email && user.password === password
    );

    // Sonucu Observable olarak döndürmeden önce gecikme ekle
    return timer(500).pipe(
      switchMap(() => {
        // switchMap kullanarak hatayı veya sonucu Observable'a çevir
        if (foundUser) {
          console.log(
            'AuthService: Mock login successful for:',
            foundUser.email,
            'Role:',
            foundUser.role
          );
          this.storeAuthData(foundUser as User); // User tipini belirt
          // Başarı durumunda kullanıcı bilgisini döndür (şifresiz)
          const { password, ...userToReturn } = foundUser;
          return of(userToReturn as User);
        } else {
          console.log('AuthService: Mock login failed for:', email);
          this.clearAuthDataInternal(); // Sadece veriyi temizle
          // Başarısız durumda hata fırlat
          return throwError(() => new Error('Invalid email or password.'));
        }
      }),
      // Genel hata yakalama (opsiyonel, ama loglama için iyi)
      catchError((err) => {
        console.error('Login pipe error:', err.message);
        // Hata durumunda subject'lerin temizlendiğinden emin ol
        this.clearAuthDataInternal();
        return throwError(() => err); // Hata objesini tekrar fırlat
      })
    );
  }

  logout(): void {
    console.log('AuthService: Logging out');
    this.clearAuthDataInternal(); // Veriyi temizle
    this.router.navigate(['/auth/login']); // Login sayfasına yönlendir
  }

  hasRole(expectedRole: 'CUSTOMER' | 'ADMIN' | 'SELLER'): boolean {
    const currentUser = this.currentUserValue;
    return !!currentUser && currentUser.role === expectedRole; // Kullanıcı null değilse ve rol eşleşiyorsa
  }

  getUserRole(): string | null {
    return this.currentUserValue?.role || null;
  }

  // register(userData: any): Observable<User | null> { ... }
}
