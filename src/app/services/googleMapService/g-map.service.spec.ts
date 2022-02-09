import { TestBed } from '@angular/core/testing';

import { GMapService } from './g-map.service';

describe('GMapService', () => {
  let service: GMapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GMapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
