import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShootDialogComponent } from './shoot-dialog.component';

describe('ShootDialogComponent', () => {
  let component: ShootDialogComponent;
  let fixture: ComponentFixture<ShootDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShootDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShootDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
