// src/app/features/seller/services/seller-profile.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

// Satıcı Profil verisi için Interface (Mock olarak tanımlıyoruz)
export interface SellerProfile {
  userId: number; // Hangi kullanıcıya ait olduğunu bilmek için
  storeName: string;
  storeDescription: string;
  contactEmail: string; // Giriş email'inden farklı olabilir
  phone: string; // Giriş telefonundan farklı olabilir
  // İleride eklenebilir: bannerImageUrl, logoUrl, addressId (addresses tablosuna referans)
}

@Injectable({
  providedIn: 'root', // Veya SellerModule'de provide edilebilir
})
export class SellerProfileService {
  private readonly PROFILE_STORAGE_KEY = 'anason_seller_profiles';
  // Profilleri sellerId'ye göre bir obje içinde tutalım
  private mockSellerProfiles: { [key: number]: SellerProfile } = {};

  constructor() {
    this.mockSellerProfiles = this.loadProfilesFromStorage();
    console.log(
      'SellerProfileService Initialized. Loaded profiles:',
      this.mockSellerProfiles
    );
  }

  // Profilleri localStorage'dan yükle
  private loadProfilesFromStorage(): { [key: number]: SellerProfile } {
    if (typeof localStorage !== 'undefined') {
      const storedProfiles = localStorage.getItem(this.PROFILE_STORAGE_KEY);
      if (storedProfiles) {
        try {
          const parsed = JSON.parse(storedProfiles);
          // Basit bir obje kontrolü
          if (typeof parsed === 'object' && parsed !== null) {
            return parsed;
          } else {
            localStorage.removeItem(this.PROFILE_STORAGE_KEY);
          }
        } catch (e) {
          console.error('Error parsing seller profiles from localStorage', e);
          localStorage.removeItem(this.PROFILE_STORAGE_KEY);
        }
      }
    }
    return {}; // Boş obje döndür
  }

  // Tüm profilleri localStorage'a kaydet
  private saveProfilesToStorage(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(
          this.PROFILE_STORAGE_KEY,
          JSON.stringify(this.mockSellerProfiles)
        );
      } catch (e) {
        console.error('Error saving seller profiles to localStorage', e);
      }
    }
  }

  // Satıcının profilini getir (Mock)
  getSellerProfile(sellerId: number): Observable<SellerProfile | null> {
    console.log(
      `SellerProfileService (Mock): Getting profile for Seller ID: ${sellerId}`
    );
    // Gerçek uygulamada API'den istenir: GET /api/sellers/{sellerId}/profile
    const profile = this.mockSellerProfiles[sellerId];

    if (profile) {
      return of(profile).pipe(delay(150));
    } else {
      // Eğer profil yoksa, bu satıcı için varsayılan boş bir yapı oluşturup döndürelim
      // veya null döndürebiliriz. Component null durumu yönetmeli.
      console.log(`No profile found for seller ${sellerId}, returning null.`);
      return of(null).pipe(delay(150));
      // Veya varsayılan boş profil:
      // const defaultProfile: SellerProfile = { userId: sellerId, storeName: '', storeDescription: '', contactEmail: '', phone: ''};
      // return of(defaultProfile).pipe(delay(150));
    }
  }

  // Satıcının profilini güncelle (Mock)
  updateSellerProfile(
    sellerId: number,
    profileData: Partial<SellerProfile>
  ): Observable<SellerProfile> {
    console.log(
      `SellerProfileService (Mock): Updating profile for Seller ID: ${sellerId}`,
      profileData
    );
    // Gerçek uygulamada API'ye gönderilir: PUT /api/sellers/{sellerId}/profile

    // Mevcut profili al veya yeni oluştur
    let existingProfile =
      this.mockSellerProfiles[sellerId] ||
      ({ userId: sellerId } as SellerProfile);

    // Gelen verilerle güncelle (userId'nin üzerine yazılmadığından emin ol)
    const updatedProfile: SellerProfile = {
      ...existingProfile, // Önceki değerleri koru
      ...profileData, // Gelen yeni değerlerle güncelle
      userId: sellerId, // userId'nin değişmediğinden emin ol
    };

    // Mock depolamayı güncelle
    this.mockSellerProfiles[sellerId] = updatedProfile;
    this.saveProfilesToStorage(); // localStorage'a kaydet

    console.log('Seller profile updated:', updatedProfile);
    return of(updatedProfile).pipe(delay(300)); // Güncellenmiş profili döndür
  }
}
