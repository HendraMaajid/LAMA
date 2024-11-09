// src/app/services/manga.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class MangaService {
  private baseUrl = 'https://api.jikan.moe/v4';

  constructor(private http: HttpClient) { }

  getPopularManga(page: number = 1): Observable<any> {
    return this.http.get(`${this.baseUrl}/top/manga?page=${page}`);
  }

  // Tambahan method baru
  getGenres(): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(`${this.baseUrl}/genres/manga`);
  }

  getManga(genreId?: number, page: number = 1): Observable<any> {
    let url = `${this.baseUrl}/manga?page=${page}`;
    if (genreId) {
      url += `&genres=${genreId}`;
    }
    return this.http.get(url);
  }

  searchManga(query: string, genreId?: number, page: number = 1): Observable<any> {
    let url = `${this.baseUrl}/manga?q=${query}&page=${page}`;
    if (genreId) {
      url += `&genres=${genreId}`;
    }
    return this.http.get(url);
  }

  getMangaDetails(id: number): Observable<any> {
    return this.http.get<MangaDetail>(`${this.baseUrl}/manga/${id}/full`);
  }

  getMangaCharacters(id: number): Observable<any> {
    return this.http.get<CharactersResponse>(`${this.baseUrl}/manga/${id}/characters`);
  }
}