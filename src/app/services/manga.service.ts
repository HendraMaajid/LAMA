// src/app/services/manga.service.ts
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

  getPopularManga(page: number = 1): Observable<any> {
    let url = `${this.baseUrl}/top/manga?page=${page}`;
    this.excludedGenres.forEach(genre => {
      url += `${url.includes('?') ? '&' : '?'}genres_exclude=${this.getGenreId(genre)}`;
    });
    return this.http.get(url);
  }

  // Tambahan method baru
 getGenres(): Observable<{ data: MangaGenre[] }> {
    return this.http.get<{ data: MangaGenre[] }>(`${this.baseUrl}/genres/manga`).pipe(
      map(response => ({
        data: response.data
          .filter(genre => !this.excludedGenres.includes(genre.name))
          .sort((a, b) => a.name.localeCompare(b.name)) // Mengurutkan berdasarkan abjad
      }))
    );
  }

  getManga(genreId?: number, page: number = 1): Observable<any> {
    let url = `${this.baseUrl}/manga?page=${page}`;
    if (genreId) {
      url += `&genres=${genreId}`;
    }
    this.excludedGenres.forEach(genre => {
      url += `&genres_exclude=${this.getGenreId(genre)}`;
    });
    return this.http.get(url);
  }

  searchManga(query: string, genreId?: number, page: number = 1): Observable<any> {
    let url = `${this.baseUrl}/manga?q=${query}&page=${page}`;
    if (genreId) {
      url += `&genres=${genreId}`;
    }

    this.excludedGenres.forEach(genre => {
      url += `&genres_exclude=${this.getGenreId(genre)}`;
    });
    return this.http.get(url);
  }

  getMangaDetails(id: number): Observable<any> {
    return this.http.get<MangaDetail>(`${this.baseUrl}/manga/${id}/full`);
  }

  getMangaCharacters(id: number): Observable<any> {
    return this.http.get<CharactersResponse>(`${this.baseUrl}/manga/${id}/characters`);
  }

   private getGenreId(genreName: string): number {
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