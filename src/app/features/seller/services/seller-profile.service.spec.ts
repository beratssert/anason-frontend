import { TestBed } from '@angular/core/testing';

import { SellerProfileService } from './seller-profile.service';

describe('SellerProfileService', () => {
  let service: SellerProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SellerProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
