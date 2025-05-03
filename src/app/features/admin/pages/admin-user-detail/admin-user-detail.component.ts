// src/app/features/admin/pages/admin-user-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AdminService,
  AdminManagedUser,
} from '../../../../core/services/admin.service';
import { ToastrService } from 'ngx-toastr';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-admin-user-detail',
  templateUrl: './admin-user-detail.component.html',
  styleUrls: ['./admin-user-detail.component.css'],
  standalone: false,
})
export class AdminUserDetailComponent implements OnInit {
  user: AdminManagedUser | null = null;
  isLoading: boolean = true;
  errorLoading: string | null = null;
  updatingStatus: boolean = false;
  userId: number | null = null;
  isResettingPassword: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private adminService: AdminService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserDetails();
  }

  loadUserDetails(): void {
    this.isLoading = true;
    this.errorLoading = null;
    this.user = null;

    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const idParam = params.get('userId'); // Rota parametresi adı 'userId' olmalı
          if (!idParam) {
            this.errorLoading = 'User ID is missing in the URL.';
            return of(undefined);
          }
          const userId = parseInt(idParam, 10);
          if (isNaN(userId)) {
            this.errorLoading = 'Invalid User ID in the URL.';
            return of(undefined);
          }
          this.userId = userId;
          return this.adminService.getUserDetails(userId).pipe(
            catchError((err) => {
              console.error('Error fetching user details for admin:', err);
              this.errorLoading = 'Failed to load user details.';
              return of(undefined);
            })
          );
        })
      )
      .subscribe((data) => {
        this.isLoading = false;
        if (data) {
          this.user = data;
        } else if (!this.errorLoading) {
          this.errorLoading = 'User not found.';
        }
        if (this.errorLoading) {
          this.toastr.error(this.errorLoading, 'Error');
          // Belki kullanıcı listesine geri yönlendirilebilir
          // this.router.navigate(['/admin/users']);
        }
      });
  }

  // Durumu güncelleme (User Management List sayfasındakine benzer)
  updateStatus(newStatus: 'ACTIVE' | 'BANNED'): void {
    if (!this.user || this.updatingStatus || this.user.status === newStatus) {
      return;
    }
    // Admin kendini banlayamasın (opsiyonel)
    // if (this.user.id === this.authService.currentUserValue?.id) {
    //    this.toastr.error("You cannot change your own status.", "Action Denied");
    //    return;
    // }

    const action = newStatus === 'BANNED' ? 'ban' : 'activate';
    if (
      !confirm(`Are you sure you want to ${action} user ${this.user.email}?`)
    ) {
      return;
    }

    this.updatingStatus = true;

    this.adminService.updateUserStatus(this.user.id, newStatus).subscribe({
      next: (updatedUser) => {
        if (updatedUser && this.user) {
          this.user.status = updatedUser.status; // Yerel durumu güncelle
          this.toastr.success(
            `User ${updatedUser.email} status updated to ${newStatus}.`,
            'Success'
          );
        } else {
          this.toastr.error(
            `Failed to update status for user ${this.user?.email}. User not found?`,
            'Error'
          );
        }
        this.updatingStatus = false;
      },
      error: (err) => {
        console.error(
          `Error updating user status for ${this.user?.email}:`,
          err
        );
        this.toastr.error(
          `Failed to update status for user ${this.user?.email}.`,
          'Error'
        );
        this.updatingStatus = false;
      },
    });
  }

  resetPassword(): void {
    if (!this.user || this.isResettingPassword || this.updatingStatus) {
      return;
    }

    if (
      !confirm(
        `Are you sure you want to trigger a password reset for user ${this.user.email}? The user will likely receive an email.`
      )
    ) {
      return;
    }

    this.isResettingPassword = true;

    this.adminService.resetUserPassword(this.user.id).subscribe({
      next: (success) => {
        if (success) {
          this.toastr.success(
            `Password reset triggered for user ${this.user?.email}.`,
            'Success'
          );
        } else {
          this.toastr.error(
            `Could not trigger password reset for user ${this.user?.email}. User not found?`,
            'Error'
          );
        }
        this.isResettingPassword = false;
      },
      error: (err) => {
        console.error(
          `Error triggering password reset for ${this.user?.email}:`,
          err
        );
        this.toastr.error(
          err.message || 'An error occurred while resetting password.',
          'Error'
        );
        this.isResettingPassword = false;
      },
    });
  }
}
