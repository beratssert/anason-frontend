import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminComplaintDetailComponent } from './admin-complaint-detail.component';

describe('AdminComplaintDetailComponent', () => {
  let component: AdminComplaintDetailComponent;
  let fixture: ComponentFixture<AdminComplaintDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminComplaintDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminComplaintDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
