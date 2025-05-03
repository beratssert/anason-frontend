import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ComparisonService {
  // Karşılaştırılabilecek maksimum ürün sayısı
  private readonly MAX_COMPARE_ITEMS = 4;
  // localStorage için anahtar
  private readonly COMPARISON_STORAGE_KEY = 'anason_comparison_list';

  // Karşılaştırılacak ürün ID'lerini tutan BehaviorSubject
  private comparedProductIdsSubject = new BehaviorSubject<number[]>(
    this.loadInitialList()
  );
  // Dışarıya açılan Observable
  public comparedProductIds$: Observable<number[]> =
    this.comparedProductIdsSubject.asObservable();

  // Karşılaştırma listesindeki ürün sayısını yayınlayan Observable
  public compareCount$: Observable<number> = this.comparedProductIds$.pipe(
    map((ids) => ids.length)
  );

  constructor() {}

  // Başlangıçta localStorage'dan listeyi yükle
  private loadInitialList(): number[] {
    if (typeof localStorage !== 'undefined') {
      const storedList = localStorage.getItem(this.COMPARISON_STORAGE_KEY);
      if (storedList) {
        try {
          const parsedList = JSON.parse(storedList);
          if (
            Array.isArray(parsedList) &&
            parsedList.every((item) => typeof item === 'number')
          ) {
            // Limiti aşanları kaldır (isteğe bağlı)
            return parsedList.slice(0, this.MAX_COMPARE_ITEMS);
          } else {
            localStorage.removeItem(this.COMPARISON_STORAGE_KEY);
          }
        } catch (e) {
          console.error('Error parsing comparison list from localStorage', e);
          localStorage.removeItem(this.COMPARISON_STORAGE_KEY);
        }
      }
    }
    return []; // Boş liste döndür
  }

  // Listeyi localStorage'a kaydet ve Subject'i güncelle
  private saveList(ids: number[]): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.COMPARISON_STORAGE_KEY, JSON.stringify(ids));
    }
    this.comparedProductIdsSubject.next(ids);
  }

  // Karşılaştırma listesine ürün ID'si ekle
  // Dönen Değer: true (eklendi), false (limit dolu veya zaten var)
  addToCompare(productId: number): boolean {
    const currentIds = this.comparedProductIdsSubject.getValue();

    // Zaten listede var mı?
    if (currentIds.includes(productId)) {
      console.log(`Product ${productId} is already in comparison list.`);
      return false; // Zaten ekli
    }

    // Limit aşıldı mı?
    if (currentIds.length >= this.MAX_COMPARE_ITEMS) {
      console.log(
        `Comparison list limit (${this.MAX_COMPARE_ITEMS}) reached. Cannot add product ${productId}.`
      );
      return false; // Limit dolu
    }

    // Ekle ve kaydet
    const newList = [...currentIds, productId];
    this.saveList(newList);
    console.log(
      `Product ${productId} added to comparison list. Current list:`,
      newList
    );
    return true; // Eklendi
  }

  // Karşılaştırma listesinden ürün ID'si kaldır
  removeFromCompare(productId: number): void {
    const currentIds = this.comparedProductIdsSubject.getValue();
    const newList = currentIds.filter((id) => id !== productId);

    if (newList.length !== currentIds.length) {
      this.saveList(newList);
      console.log(
        `Product ${productId} removed from comparison list. Current list:`,
        newList
      );
    }
  }

  // Listede olup olmadığını kontrol et
  isInCompareList(productId: number): boolean {
    return this.comparedProductIdsSubject.getValue().includes(productId);
  }

  // Karşılaştırma listesini temizle
  clearCompare(): void {
    this.saveList([]);
    console.log('Comparison list cleared.');
  }
}
