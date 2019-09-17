import { TestBed } from '@angular/core/testing';

import { NgxCameraFilterService } from './ngx-camera-filter.service';

describe('NgxCameraFilterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NgxCameraFilterService = TestBed.get(NgxCameraFilterService);
    expect(service).toBeTruthy();
  });
});
