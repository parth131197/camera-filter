import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Camera2Component } from './camera2.component';

describe('Camera2Component', () => {
  let component: Camera2Component;
  let fixture: ComponentFixture<Camera2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Camera2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Camera2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
