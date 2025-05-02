import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AdminService,
  Complaint,
  ComplaintStatus,
} from '../../../../core/services/admin.service';
import { ToastrService } from 'ngx-toastr';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-admin-complaint-detail',
  templateUrl: './admin-complaint-detail.component.html',
  styleUrls: ['./admin-complaint-detail.component.css'],
  standalone: false,
})
export class AdminComplaintDetailComponent implements OnInit {
  complaint: Complaint | null = null;
  isLoading: boolean = true;
  errorLoading: string | null = null;
  updatingStatus: boolean = false;
  possibleStatuses: ComplaintStatus[];

  constructor(
    private route: ActivatedRoute,
    private adminService: AdminService,
    private toastr: ToastrService,
    private router: Router // Router genellikle lazım olmaz ama eklenebilir
  ) {
    this.possibleStatuses = this.adminService.complaintStatuses;
  }

  ngOnInit(): void {
    this.loadComplaintDetails();
  }

  loadComplaintDetails(): void {
    this.isLoading = true;
    this.errorLoading = null;
    this.complaint = null;

    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const idParam = params.get('complaintId');
          if (!idParam) {
            this.errorLoading = 'Complaint ID is missing in the URL.';
            return of(undefined);
          }
          const complaintId = parseInt(idParam, 10);
          if (isNaN(complaintId)) {
            this.errorLoading = 'Invalid Complaint ID in the URL.';
            return of(undefined);
          }
          return this.adminService.getComplaintById(complaintId).pipe(
            catchError((err) => {
              console.error('Error fetching complaint details:', err);
              this.errorLoading = 'Failed to load complaint details.';
              return of(undefined);
            })
          );
        })
      )
      .subscribe((data) => {
        this.isLoading = false;
        if (data) {
          this.complaint = data;
        } else if (!this.errorLoading) {
          this.errorLoading = 'Complaint not found.';
        }
      });
  }

  // Durumu güncelleme - Metot imzası ve içerik GÜNCELLENDİ
  updateStatus(event: Event): void {
    if (!this.complaint || this.updatingStatus) {
      return; // Şikayet yüklenmediyse veya zaten güncelleniyorsa çık
    }

    // Event target'ı HTMLSelectElement'e cast et
    const selectElement = event.target as HTMLSelectElement;
    const newStatus = selectElement.value as ComplaintStatus;

    if (!newStatus || newStatus === this.complaint.status) {
      return; // Değişiklik yoksa çık
    }

    this.updatingStatus = true; // Güncelleme başladı

    this.adminService
      .updateComplaintStatus(this.complaint.id, newStatus)
      .subscribe({
        next: (updatedComplaint) => {
          if (updatedComplaint && this.complaint) {
            this.complaint.status = updatedComplaint.status;
            this.toastr.success(
              `Complaint #${this.complaint.id} status updated to ${newStatus}.`,
              'Success'
            );
          } else {
            this.toastr.error(
              `Failed to update status for complaint #${this.complaint?.id}.`,
              'Error'
            );
            if (this.complaint) {
              selectElement.value = this.complaint.status;
            }
          }
          this.updatingStatus = false;
        },
        error: (err) => {
          console.error(
            `Error updating complaint status for ${this.complaint?.id}:`,
            err
          );
          this.toastr.error(
            `Failed to update status for complaint #${this.complaint?.id}.`,
            'Error'
          );
          if (this.complaint) {
            selectElement.value = this.complaint.status;
          }
          this.updatingStatus = false;
        },
      });
  }

  // Şikayet detaylarını göstermek için (opsiyonel)
  viewRelatedOrder(orderId: number): void {
    this.router.navigate(['/admin/orders'], {
      queryParams: { search: orderId },
    });
  }
  viewRelatedUser(userId: number): void {
    this.router.navigate(['/admin/users'], { queryParams: { search: userId } });
  }
}
