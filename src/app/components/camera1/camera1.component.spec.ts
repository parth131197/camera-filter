import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Camera1Component } from './camera1.component';

describe('Camera1Component', () => {
  let component: Camera1Component;
  let fixture: ComponentFixture<Camera1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Camera1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Camera1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
