import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlideShowContestsComponent } from './slide-show-contests.component';

describe('SlideShowContestsComponent', () => {
  let component: SlideShowContestsComponent;
  let fixture: ComponentFixture<SlideShowContestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlideShowContestsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SlideShowContestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
