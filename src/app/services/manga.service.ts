import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';

interface MangaDetail {
  data: {
    mal_id: number;
    title: string;
    images: {
      webp: {
        large_image_url: string
      }
    };
    score: number;
    chapters: number;
    status: string;
    published: {
      string: string;
    };
    synopsis: string;
    background: string;
    authors: Array<{
      name: string;
    }>;
    genres: Array<{
      name: string;
      type: string;
    }>;
  };
}

interface CharactersResponse {
  data: Array<{
    character: {
      mal_id: number;
      name: string;
      images: {
        jpg: {
          image_url: string;
        }
      };
    };
    role: string;
  }>;
}

interface MangaGenre {
  mal_id: number;
  name: string;
  count: number;
}

interface MangaResponse {
  data: Array<{
    mal_id: number;
    title: string;
    genres: Array<{
      mal_id: number;
      name: string;
    }>;
  }>;
  pagination: {
    last_visible_page: number;
    has_next_page: boolean;
    current_page: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class MangaService {
  private baseUrl = 'https://api.jikan.moe/v4';

  private excludedGenres = [
    'Erotica',
    'Hentai',
    'Boys Love',
    'Girls Love',
    'Adult Cast',
    'Magical Sex Shift'
  ];

  constructor(private http: HttpClient) { }

  // Helper method to build URL with excluded genres
  private buildUrlWithExcludedGenres(baseUrl: string): string {
    let url = baseUrl;
    const excludedGenreIds = this.excludedGenres.map(genre => this.getGenreId(genre));
    
    excludedGenreIds.forEach(genreId => {
      if (genreId > 0) {
        url += `${url.includes('?') ? '&' : '?'}genres_exclude=${genreId}`;
      }
    });
    return url;
  }

  getPopularManga(page: number = 1): Observable<MangaResponse> {
    const baseUrl = `${this.baseUrl}/top/manga?page=${page}`;
    return this.http.get<MangaResponse>(this.buildUrlWithExcludedGenres(baseUrl));
  }

  getGenres(): Observable<{ data: MangaGenre[] }> {
    return this.http.get<{ data: MangaGenre[] }>(`${this.baseUrl}/genres/manga`).pipe(
      map(response => ({
        data: response.data
          .filter(genre => !this.excludedGenres.includes(genre.name))
          .sort((a, b) => a.name.localeCompare(b.name))
      }))
    );
  }

  getManga(genreId?: number, page: number = 1): Observable<MangaResponse> {
    let baseUrl = `${this.baseUrl}/manga?page=${page}`;
    if (genreId) {
      baseUrl += `&genres=${genreId}`;
    }
    return this.http.get<MangaResponse>(this.buildUrlWithExcludedGenres(baseUrl));
  }

  searchManga(query: string, genreId?: number, page: number = 1): Observable<MangaResponse> {
    let baseUrl = `${this.baseUrl}/manga?q=${query}&page=${page}`;
    if (genreId) {
      baseUrl += `&genres=${genreId}`;
    }
    
    const url = this.buildUrlWithExcludedGenres(baseUrl);
    
    return this.http.get<MangaResponse>(url).pipe(
      map((response: MangaResponse) => {
        if (!response.data) return response;
        
        response.data = response.data.filter((manga) => {
          const mangaGenres: string[] = manga.genres.map(g => g.name);
          return !mangaGenres.some((genre: string) => this.excludedGenres.includes(genre));
        });
        
        return response;
      })
    );
  }

  getMangaDetails(id: number): Observable<MangaDetail> {
    return this.http.get<MangaDetail>(`${this.baseUrl}/manga/${id}/full`).pipe(
      map(response => {
        // Filter out manga if it contains any excluded genres
        const hasExcludedGenre = response.data.genres.some(genre => 
          this.excludedGenres.includes(genre.name)
        );
        if (hasExcludedGenre) {
          throw new Error('Manga contains excluded genre');
        }
        return response;
      })
    );
  }

  getMangaCharacters(id: number): Observable<CharactersResponse> {
    return this.http.get<CharactersResponse>(`${this.baseUrl}/manga/${id}/characters`);
  }

  private getGenreId(genreName: string): number {
    const genreMap: { [key: string]: number } = {
      'Erotica': 49,
      'Hentai': 12,
      'Boys Love': 28,
      'Girls Love': 26,
      'Adult Cast': 50,
      'Magical Sex Shift': 65
    };
    return genreMap[genreName] || 0;
  }
}