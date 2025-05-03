import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

// Interfaces
export interface AdminManagedUser {
  id: number;
  username?: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SELLER';
  status: 'ACTIVE' | 'BANNED';
  created_at: Date | string;
}

export type ComplaintIssueType = 'PAYMENT' | 'DELIVERY' | 'PRODUCT' | 'OTHER';
export type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export interface Complaint {
  id: number;
  user_id: number;
  order_id: number;
  issue_type: ComplaintIssueType;
  description: string;
  status: ComplaintStatus;
  created_at: Date | string;
  userEmail?: string; // Mock data convenience
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  // Mock User Data (Passwords Excluded)
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

  // Mock Complaint Data
  private mockComplaints: Complaint[] = [
    {
      id: 501,
      user_id: 1,
      order_id: 1001,
      issue_type: 'PRODUCT',
      description: 'Smartwatch screen flickers sometimes.',
      status: 'OPEN',
      created_at: new Date('2024-04-27T08:00:00Z'),
      userEmail: 'customer@example.com',
    },
    {
      id: 502,
      user_id: 2,
      order_id: 1002,
      issue_type: 'DELIVERY',
      description: 'Package was left outside in the rain.',
      status: 'IN_PROGRESS',
      created_at: new Date('2024-04-29T16:10:00Z'),
      userEmail: 'seller@example.com',
    },
    {
      id: 503,
      user_id: 1,
      order_id: 1003,
      issue_type: 'PAYMENT',
      description: 'Was I charged twice for the mug set?',
      status: 'RESOLVED',
      created_at: new Date('2024-05-02T10:00:00Z'),
      userEmail: 'customer@example.com',
    },
    {
      id: 504,
      user_id: 4,
      order_id: 1005,
      issue_type: 'OTHER',
      description: 'Website was slow yesterday.',
      status: 'REJECTED',
      created_at: new Date('2024-05-01T11:00:00Z'),
      userEmail: 'banned@example.com',
    },
  ];

  public readonly complaintStatuses: ComplaintStatus[] = [
    'OPEN',
    'IN_PROGRESS',
    'RESOLVED',
    'REJECTED',
  ];

  constructor() {}

  // User Management Methods
  getUsers(): Observable<AdminManagedUser[]> {
    return of([...this.mockAdminUsers]).pipe(delay(300)); // Return a copy
  }

  updateUserStatus(
    userId: number,
    newStatus: 'ACTIVE' | 'BANNED'
  ): Observable<AdminManagedUser | undefined> {
    const userIndex = this.mockAdminUsers.findIndex((u) => u.id === userId);
    if (userIndex > -1) {
      // Add checks here if needed (e.g., prevent banning self)
      this.mockAdminUsers[userIndex].status = newStatus;
      this.mockAdminUsers[userIndex].created_at = new Date(
        this.mockAdminUsers[userIndex].created_at
      ); // Ensure date object if needed elsewhere
      return of({ ...this.mockAdminUsers[userIndex] }).pipe(delay(200)); // Return a copy
    } else {
      return of(undefined).pipe(delay(200));
    }
  }

  // Complaint Management Methods
  getComplaints(): Observable<Complaint[]> {
    const allComplaints = [...this.mockComplaints].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return of(allComplaints).pipe(delay(300));
  }

  updateComplaintStatus(
    complaintId: number,
    newStatus: ComplaintStatus
  ): Observable<Complaint | null> {
    const complaintIndex = this.mockComplaints.findIndex(
      (c) => c.id === complaintId
    );
    if (complaintIndex > -1) {
      this.mockComplaints[complaintIndex].status = newStatus;
      this.mockComplaints[complaintIndex].created_at = new Date(
        this.mockComplaints[complaintIndex].created_at
      ); // Ensure date object
      return of({ ...this.mockComplaints[complaintIndex] }).pipe(delay(250)); // Return a copy
    } else {
      return of(null).pipe(delay(250));
    }
  }

  getComplaintById(complaintId: number): Observable<Complaint | undefined> {
    console.log(
      `AdminService (Mock): Fetching complaint details for ID: ${complaintId}`
    );
    // Gerçek uygulamada API çağrısı /api/admin/complaints/{complaintId} gibi bir endpoint'e yapılır
    const complaint = this.mockComplaints.find((c) => c.id === complaintId);
    if (complaint) {
      // Tarihi Date objesine çevirelim
      complaint.created_at = new Date(complaint.created_at);
    }
    console.log('Found complaint:', complaint);
    return of(complaint).pipe(delay(200)); // Bulunduysa veya undefined ise döndür
  }

  getUserDetails(userId: number): Observable<AdminManagedUser | undefined> {
    console.log(`AdminService (Mock): Fetching details for user ${userId}`);
    // Gerçek uygulamada /api/admin/users/{userId} gibi bir endpoint çağrılır
    const user = this.mockAdminUsers.find((u) => u.id === userId);
    if (user) {
      // Tarihi Date objesine çevir ve kopyasını döndür
      return of({ ...user, created_at: new Date(user.created_at) }).pipe(
        delay(150)
      );
    } else {
      console.log(`User ${userId} not found.`);
      return of(undefined).pipe(delay(150));
    }
  }

  resetUserPassword(userId: number): Observable<boolean> {
    console.log(
      `AdminService (Mock): [ADMIN] Attempting to reset password for user ${userId}`
    );
    // Kullanıcının var olup olmadığını kontrol et (opsiyonel ama iyi pratik)
    const userExists = this.mockAdminUsers.some((u) => u.id === userId);

    if (userExists) {
      // Gerçek uygulamada: Backend API çağrılır, email gönderilir vb.
      console.log(
        `Password reset triggered for user ${userId}. (No actual change in mock)`
      );
      // Başarıyı simüle et
      return of(true).pipe(delay(500));
    } else {
      console.error(`[ADMIN] User ${userId} not found for password reset.`);
      // Başarısızlığı simüle et
      return of(false).pipe(delay(500));
    }
  }
}
