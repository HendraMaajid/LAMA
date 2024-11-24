// src/app/services/anime.service.ts
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
  getPopularAnime(page: number = 1): Observable<any> {
    let url = `${this.baseUrl}/top/anime?page=${page}`;
    this.excludedGenres.forEach(genre => {
      url += `${url.includes('?') ? '&' : '?'}genres_exclude=${this.getGenreId(genre)}`;
    });
    return this.http.get(url);
  }
  getSeasonsAnime(): Observable<any> {
    let url = `${this.baseUrl}/seasons/now`;
    // Tambahkan parameter untuk mengecualikan genre yang tidak diinginkan
    this.excludedGenres.forEach(genre => {
      url += `${url.includes('?') ? '&' : '?'}genres_exclude=${this.getGenreId(genre)}`;
    });
    return this.http.get(url);
  }
  getAnimeDetails(id: number): Observable<AnimeDetail> {
    return this.http.get<AnimeDetail>(`${this.baseUrl}/anime/${id}/full`);
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
          .sort((a, b) => a.name.localeCompare(b.name)) // Mengurutkan berdasarkan nama
      }))
    );
  }


  getAnime(genreId?: number, page: number = 1): Observable<any> {
    let url = `${this.baseUrl}/anime?page=${page}`;
    if (genreId) {
      url += `&genres=${genreId}`;
    }
    this.excludedGenres.forEach(genre => {
      url += `&genres_exclude=${this.getGenreId(genre)}`;
    });
    return this.http.get(url);
  }


  searchAnime(query: string, genreId?: number, page: number = 1): Observable<any> {
    let url = `${this.baseUrl}/anime?q=${query}&page=${page}`;
    if (genreId) {
      url += `&genres=${genreId}`;
    }
    // Tambahkan parameter untuk mengecualikan genre yang tidak diinginkan
    this.excludedGenres.forEach(genre => {
      url += `&genres_exclude=${this.getGenreId(genre)}`;
    });
    return this.http.get(url);
  }
  private getGenreId(genreName: string): number {
    // Mapping genre names to their MAL IDs
    const genreMap: { [key: string]: number } = {
      'Erotica' : 49,
      'Hentai' : 12,
      'Boys Love' : 28,
      'Girls Love' : 26,
      'Adult Cast' : 50,
      'Magical Sex Shift' : 65
    };
    return genreMap[genreName] || 0;
  }


}