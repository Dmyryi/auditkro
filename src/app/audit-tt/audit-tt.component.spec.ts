import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditTtComponent } from './audit-tt.component';

describe('AuditTtComponent', () => {
  let component: AuditTtComponent;
  let fixture: ComponentFixture<AuditTtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditTtComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditTtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
