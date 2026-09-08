import { TestBed } from '@angular/core/testing';

import { PortuguesePaginatorIntl } from './portuguese-paginator-intl';

describe('PortuguesePaginatorIntl', () => {
  let service: PortuguesePaginatorIntl;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PortuguesePaginatorIntl);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
