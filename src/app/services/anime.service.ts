import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';

interface AnimeGenre {
  mal_id: number;
  name: string;
  count: number;
}

interface AnimeDetail {
  data: {
    mal_id: number;
    title: string;
    images: {
      webp: {
        large_image_url: string
      }
    };
    score: number;
    episodes: number;
    status: string;
    aired: {
      string: string;
    };
    duration: string;
    rating: string;
    synopsis: string;
    background: string;
    genres: Array<{
      name: string;
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
    voice_actors: Array<{
      person: {
        name: string;
      };
      language: string;
    }>;
  }>;
}

interface AnimeResponse {
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
export class AnimeService {
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

  getPopularAnime(page: number = 1): Observable<any> {
    const baseUrl = `${this.baseUrl}/top/anime?page=${page}`;
    return this.http.get(this.buildUrlWithExcludedGenres(baseUrl));
  }

  getSeasonsAnime(): Observable<any> {
    const baseUrl = `${this.baseUrl}/seasons/now`;
    return this.http.get(this.buildUrlWithExcludedGenres(baseUrl));
  }

  getAnimeDetails(id: number): Observable<AnimeDetail> {
    return this.http.get<AnimeDetail>(`${this.baseUrl}/anime/${id}/full`).pipe(
      map(response => {
        const hasExcludedGenre = response.data.genres.some(genre => 
          this.excludedGenres.includes(genre.name)
        );
        if (hasExcludedGenre) {
          throw new Error('Anime contains excluded genre');
        }
        return response;
      })
    );
  }

  getAnimeCharacters(id: number): Observable<CharactersResponse> {
    return this.http.get<CharactersResponse>(`${this.baseUrl}/anime/${id}/characters`);
  }

  getAnimeEpisodes(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/anime/${id}/episodes`);
  }

  getAnimeEpisodesbyId(id: number, episodes: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/anime/${id}/episodes/${episodes}`);
  }

  getGenres(): Observable<{ data: AnimeGenre[] }> {
    return this.http.get<{ data: AnimeGenre[] }>(`${this.baseUrl}/genres/anime`).pipe(
      map(response => ({
        data: response.data
          .filter(genre => !this.excludedGenres.includes(genre.name))
          .sort((a, b) => a.name.localeCompare(b.name))
      }))
    );
  }

  getAnime(genreId?: number, page: number = 1): Observable<any> {
    let baseUrl = `${this.baseUrl}/anime?page=${page}`;
    if (genreId) {
      baseUrl += `&genres=${genreId}`;
    }
    return this.http.get(this.buildUrlWithExcludedGenres(baseUrl));
  }

  searchAnime(query: string, genreId?: number, page: number = 1): Observable<AnimeResponse> {
    let baseUrl = `${this.baseUrl}/anime?q=${query}&page=${page}`;
    if (genreId) {
      baseUrl += `&genres=${genreId}`;
    }
    
    const url = this.buildUrlWithExcludedGenres(baseUrl);
    
    return this.http.get<AnimeResponse>(url).pipe(
      map((response: AnimeResponse) => {
        if (!response.data) return response;
        
        response.data = response.data.filter((anime) => {
          const animeGenres: string[] = anime.genres.map(g => g.name);
          return !animeGenres.some((genre: string) => this.excludedGenres.includes(genre));
        });
        
        return response;
      })
    );
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