import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShootBottomsheetComponent } from './shoot-bottomsheet.component';

describe('ShootBottomsheetComponent', () => {
  let component: ShootBottomsheetComponent;
  let fixture: ComponentFixture<ShootBottomsheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShootBottomsheetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShootBottomsheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
