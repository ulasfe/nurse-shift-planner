import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PivotDisplayComponent } from './pivot-display.component';

describe('PivotDisplayComponent', () => {
  let component: PivotDisplayComponent;
  let fixture: ComponentFixture<PivotDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PivotDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PivotDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
