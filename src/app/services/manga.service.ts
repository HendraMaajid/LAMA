// src/app/services/anime.service.ts
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
    genres: Array<{
      name: string;
    }>;
  };
}

@Injectable({
  providedIn: 'root'
})
export class MangaService {
  private baseUrl = 'https://api.jikan.moe/v4';

  constructor(private http: HttpClient) { }

  getPopularManga(): Observable<any> {
    return this.http.get(`${this.baseUrl}/top/manga`);
  }

  searchManga(query: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/manga?q=${query}`);
  }
}