// src/app/services/anime.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';

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

  constructor(private http: HttpClient) { }
  getPopularAnime(): Observable<any> {
    return this.http.get(`${this.baseUrl}/top/anime`);
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
    return this.http.get<{ data: AnimeGenre[] }>(`${this.baseUrl}/genres/anime`);
  }

  getAnime(genreId?: number, page: number = 1): Observable<any> {
    let url = `${this.baseUrl}/anime?page=${page}`;
    if (genreId) {
      url += `&genres=${genreId}`;
    }
    return this.http.get(url);
  }


  searchAnime(query: string, genreId?: number, page: number = 1): Observable<any> {
    let url = `${this.baseUrl}/anime?q=${query}&page=${page}`;
    if (genreId) {
      url += `&genres=${genreId}`;
    }
    return this.http.get(url);
  }


}