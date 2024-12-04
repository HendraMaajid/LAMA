import { TestBed } from '@angular/core/testing';

import { ForumAnimeService } from './forum.anime.service';

describe('ForumService', () => {
  let service: ForumAnimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ForumAnimeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
