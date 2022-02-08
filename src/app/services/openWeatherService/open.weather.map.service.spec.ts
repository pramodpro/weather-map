import { TestBed } from '@angular/core/testing';

import { openWeatherMapService } from './open.weather.map.service';

describe('MapService', () => {
  let service: openWeatherMapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(openWeatherMapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
