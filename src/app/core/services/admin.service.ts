import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';

export interface AdminManagedUser {
  id: number;
  username?: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SELLER';
  status: 'ACTIVE' | 'BANNED';
  created_at: Date | string;
  // password buraya dahil edilmez
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  // Şifreleri buraya KOYMAYALIM!
  private mockAdminUsers: AdminManagedUser[] = [
    {
      id: 1,
      email: 'customer@example.com',
      role: 'CUSTOMER' as const,
      username: 'Cust Omer',
      status: 'ACTIVE' as const,
      created_at: new Date('2024-01-15T10:00:00Z'),
    },
    {
      id: 2,
      email: 'seller@example.com',
      role: 'SELLER' as const,
      username: 'Sell Er',
      status: 'ACTIVE' as const,
      created_at: new Date('2024-02-20T11:30:00Z'),
    },
    {
      id: 3,
      email: 'admin@example.com',
      role: 'ADMIN' as const,
      username: 'Admin İstrator',
      status: 'ACTIVE' as const,
      created_at: new Date('2023-12-01T09:00:00Z'),
    },
    {
      id: 4,
      email: 'banned@example.com',
      role: 'CUSTOMER' as const,
      username: 'Banned User',
      status: 'BANNED' as const,
      created_at: new Date('2024-03-10T15:00:00Z'),
    },
  ];

  constructor() {}

  // Tüm kullanıcıları getiren mock metot
  getUsers(): Observable<AdminManagedUser[]> {
    console.log('AdminService (Mock): Fetching all users...');
    // Gerçek uygulamada API'den gelen veri AdminManagedUser[] tipinde olmalı
    return of(this.mockAdminUsers).pipe(delay(300));
  }

  // Kullanıcı durumunu güncelleyen mock metot
  updateUserStatus(
    userId: number,
    newStatus: 'ACTIVE' | 'BANNED'
  ): Observable<AdminManagedUser | undefined> {
    console.log(
      `AdminService (Mock): Updating status for user ${userId} to ${newStatus}`
    );
    const userIndex = this.mockAdminUsers.findIndex((u) => u.id === userId);
    if (userIndex > -1) {
      // Admin kendi durumunu değiştiremez gibi kontroller eklenebilir
      this.mockAdminUsers[userIndex].status = newStatus;
      // Güncellenen kullanıcıyı döndür
      return of(this.mockAdminUsers[userIndex]).pipe(delay(200));
    } else {
      console.error(
        `AdminService (Mock): User with ID ${userId} not found for status update.`
      );
      // Hata durumunu belirtmek için undefined döndür
      return of(undefined).pipe(delay(200));
    }
  }
}
