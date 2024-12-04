import { TestBed } from '@angular/core/testing';

import { ForumMangaService } from './forum.manga.service';

describe('ForumMangaService', () => {
  let service: ForumMangaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ForumMangaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
