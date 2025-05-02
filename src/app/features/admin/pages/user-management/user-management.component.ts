import { Component, OnInit } from '@angular/core';
import {
  AdminService,
  AdminManagedUser,
} from '../../../../core/services/admin.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
  standalone: false,
})
export class UserManagementComponent implements OnInit {
  users: AdminManagedUser[] = [];
  isLoading: boolean = true;
  updatingUserId: number | null = null; // Hangi kullanıcının durumu güncelleniyor

  constructor(
    private adminService: AdminService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.toastr.error('Failed to load users.', 'Error');
        this.isLoading = false;
      },
    });
  }

  updateStatus(user: AdminManagedUser, newStatus: 'ACTIVE' | 'BANNED'): void {
    const action = newStatus === 'BANNED' ? 'ban' : 'activate';
    if (!confirm(`Are you sure you want to ${action} user ${user.email}?`)) {
      return;
    }

    this.updatingUserId = user.id; // Butonu pasif yapmak için ID'yi sakla

    this.adminService.updateUserStatus(user.id, newStatus).subscribe({
      next: (updatedUser) => {
        if (updatedUser) {
          // Listedeki kullanıcıyı güncelle (veya listeyi yeniden yükle)
          const index = this.users.findIndex((u) => u.id === updatedUser.id);
          if (index > -1) {
            this.users[index] = updatedUser;
          }
          this.toastr.success(
            `User ${updatedUser.email} status updated to ${newStatus}.`,
            'Success'
          );
        } else {
          this.toastr.error(
            `Failed to update status for user ${user.email}. User not found.`,
            'Error'
          );
        }
        this.updatingUserId = null; // İşlem bitti
      },
      error: (err) => {
        console.error(`Error updating user status for ${user.email}:`, err);
        this.toastr.error(
          `Failed to update status for user ${user.email}.`,
          'Error'
        );
        this.updatingUserId = null; // İşlem bitti (hata ile)
      },
    });
  }
}
