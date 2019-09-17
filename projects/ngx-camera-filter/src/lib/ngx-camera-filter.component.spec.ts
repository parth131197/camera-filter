import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxCameraFilterComponent } from './ngx-camera-filter.component';

describe('NgxCameraFilterComponent', () => {
  let component: NgxCameraFilterComponent;
  let fixture: ComponentFixture<NgxCameraFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgxCameraFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxCameraFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
