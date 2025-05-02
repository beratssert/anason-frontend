// src/app/features/admin/pages/admin-complaint-management.component.ts
import { Component, OnInit } from '@angular/core';
import {
  AdminService,
  Complaint,
  ComplaintStatus,
} from '../../../../core/services/admin.service'; // AdminService ve tipleri import et
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-complaint-management',
  templateUrl: './admin-complaint-management.component.html',
  styleUrls: ['./admin-complaint-management.component.css'],
  standalone: false,
})
export class AdminComplaintManagementComponent implements OnInit {
  complaints: Complaint[] = [];
  isLoading: boolean = true;
  updatingComplaintId: number | null = null;
  possibleStatuses: ComplaintStatus[];

  constructor(
    private adminService: AdminService,
    private toastr: ToastrService
  ) {
    this.possibleStatuses = this.adminService.complaintStatuses;
  }

  ngOnInit(): void {
    this.loadComplaints();
  }

  loadComplaints(): void {
    this.isLoading = true;
    this.adminService.getComplaints().subscribe({
      next: (data) => {
        // Tarihleri Date objesine çevir
        this.complaints = data.map((c) => ({
          ...c,
          created_at: new Date(c.created_at),
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading complaints:', err);
        this.toastr.error('Failed to load complaints.', 'Error');
        this.isLoading = false;
      },
    });
  }

  // Durum değişikliğini yöneten metot
  onStatusChange(complaint: Complaint, event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newStatus = selectElement.value as ComplaintStatus;

    if (!newStatus || newStatus === complaint.status) return;

    this.updatingComplaintId = complaint.id;

    this.adminService.updateComplaintStatus(complaint.id, newStatus).subscribe({
      next: (updatedComplaint) => {
        if (updatedComplaint) {
          const index = this.complaints.findIndex(
            (c) => c.id === updatedComplaint.id
          );
          if (index > -1) {
            // Sadece status'ü güncellemek yeterli, referansı koru
            this.complaints[index].status = updatedComplaint.status;
          }
          this.toastr.success(
            `Complaint #${complaint.id} status updated to ${newStatus}.`,
            'Success'
          );
        } else {
          this.toastr.error(
            `Failed to update status for complaint #${complaint.id}.`,
            'Error'
          );
          selectElement.value = complaint.status; // Eski değere döndür
        }
        this.updatingComplaintId = null;
      },
      error: (err) => {
        console.error(
          `Error updating complaint status for ${complaint.id}:`,
          err
        );
        this.toastr.error(
          `Failed to update status for complaint #${complaint.id}.`,
          'Error'
        );
        selectElement.value = complaint.status; // Eski değere döndür
        this.updatingComplaintId = null;
      },
    });
  }

  // Şikayet detaylarını görmek için (ileride)
  viewComplaintDetails(complaintId: number): void {
    this.toastr.info(
      `Maps to complaint details for ID: ${complaintId} (not implemented yet)`
    );
    // this.router.navigate(['/admin/complaints', complaintId]);
  }
}
