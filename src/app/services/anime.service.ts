// src/app/services/anime.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';

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

  getSeasonsAnime(): Observable<any> {
    return this.http.get(`${this.baseUrl}/seasons/now`);
  }

  searchAnime(query: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/anime?q=${query}`);
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
}