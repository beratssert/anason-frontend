// src/app/features/seller/pages/seller-profile.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../../core/services/auth.service';
import {
  SellerProfileService,
  SellerProfile,
} from '../../services/seller-profile.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-seller-profile',
  templateUrl: './seller-profile.component.html',
  styleUrls: ['./seller-profile.component.css'],
  standalone: false,
})
export class SellerProfileComponent implements OnInit {
  profileForm!: FormGroup;
  isLoading: boolean = true;
  isSaving: boolean = false;
  currentSeller: User | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private sellerProfileService: SellerProfileService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentSeller = this.authService.currentUserValue;
    if (
      !this.currentSeller ||
      (this.currentSeller.role !== 'SELLER' &&
        this.currentSeller.role !== 'ADMIN')
    ) {
      this.handleUnauthorized();
      return;
    }
    this.initForm(); // Önce boş formu başlat
    this.loadProfile(this.currentSeller.id); // Sonra veriyi yükle ve formu doldur
  }

  // Formu başlatan metot
  initForm(profileData: SellerProfile | null = null): void {
    this.profileForm = this.fb.group({
      storeName: [
        profileData?.storeName || '',
        [Validators.required, Validators.minLength(3)],
      ],
      storeDescription: [
        profileData?.storeDescription || '',
        Validators.maxLength(500),
      ],
      contactEmail: [
        profileData?.contactEmail || this.currentSeller?.email || '',
        [Validators.required, Validators.email],
      ],
      phone: [profileData?.phone || '', Validators.required], // Telefon validasyonu eklenebilir
    });
  }

  // Profili yükleyen metot
  loadProfile(sellerId: number): void {
    this.isLoading = true;
    this.sellerProfileService.getSellerProfile(sellerId).subscribe({
      next: (data) => {
        // Profil verisi varsa formu doldur, yoksa boş form kalır
        if (data) {
          this.profileForm.patchValue(data);
        } else {
          // Opsiyonel: Eğer mock servis null döndürürse ve varsayılan
          // değerleri forma yüklemek istersek burada initForm'u tekrar çağırabiliriz.
          // this.initForm(); // Zaten başta çağrıldı, tekrar gerek yok gibi.
          this.profileForm.patchValue({
            contactEmail: this.currentSeller?.email || '',
          }); // email'i doldur
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading seller profile:', err);
        this.toastr.error('Failed to load profile data.', 'Error');
        this.isLoading = false;
        // Hata durumunda formu sıfırlayabilir veya boş bırakabiliriz
        this.initForm();
      },
    });
  }

  // Formu gönderme metodu
  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.toastr.warning(
        'Please fill all required fields correctly.',
        'Invalid Form'
      );
      return;
    }

    if (!this.currentSeller) return; // Teorik olarak olmaz ama kontrol edelim

    this.isSaving = true;
    const formData = this.profileForm.value;

    this.sellerProfileService
      .updateSellerProfile(this.currentSeller.id, formData)
      .subscribe({
        next: (updatedProfile) => {
          this.isSaving = false;
          this.toastr.success('Profile updated successfully!', 'Success');
          // Formu güncel veriyle tekrar patch'leyebiliriz veya öyle bırakabiliriz
          // this.profileForm.patchValue(updatedProfile);
        },
        error: (err) => {
          this.isSaving = false;
          console.error('Error updating seller profile:', err);
          this.toastr.error(
            'Failed to update profile. Please try again.',
            'Error'
          );
        },
      });
  }

  handleUnauthorized(): void {
    this.toastr.error('Unauthorized access.', 'Error');
    this.isLoading = false;
    this.router.navigate(['/']); // Ana sayfaya yönlendir
  }

  // Form kontrolleri için getter'lar
  get storeName() {
    return this.profileForm.get('storeName');
  }
  get storeDescription() {
    return this.profileForm.get('storeDescription');
  }
  get contactEmail() {
    return this.profileForm.get('contactEmail');
  }
  get phone() {
    return this.profileForm.get('phone');
  }
}
