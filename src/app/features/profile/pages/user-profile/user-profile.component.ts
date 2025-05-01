// src/app/features/profile/pages/user-profile.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../../../core/services/auth.service'; // AuthService ve User import et
import { Observable } from 'rxjs';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
  standalone: false,
})
export class UserProfileComponent implements OnInit {
  // Kullanıcı bilgisini Observable olarak tut
  user$: Observable<User | null>;

  constructor(private authService: AuthService) {
    this.user$ = this.authService.currentUser$; // Servisten observable'ı al
  }

  ngOnInit(): void {
    // Genellikle burada ek veri çekme işlemleri yapılabilir (örn: adresler, siparişler)
  }
}
