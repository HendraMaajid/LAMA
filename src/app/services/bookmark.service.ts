// src/app/services/bookmark.service.ts
import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore, collection, doc,  setDoc, deleteDoc, query, where, getDocs,getDoc, collectionData} from '@angular/fire/firestore';
import { Observable, from, map, of, firstValueFrom } from 'rxjs'; 
import { AnimeService } from './anime.service';
import { MangaService } from './manga.service';

export interface Bookmark {
  id?: string;
  userId: string;
  animeId?: number;
  mangaId?: number;
  title: string;
  imageUrl: string;
  type: 'anime' | 'manga';
  createdAt: Date;
  totalEpisodes?: number;  
  totalChapters?: number;  
  currentEpisode?: number; 
  currentChapter?: number; 
  lastUpdated?: Date;      
}

@Injectable({
  providedIn: 'root'
})
export class BookmarkService {
  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private animeService: AnimeService,
    private mangaService: MangaService
  ) {}

  // Add bookmark
 async addBookmark(data: Omit<Bookmark, 'userId' | 'createdAt'>): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('User must be logged in to bookmark');

    let bookmarkData: any = {
      ...data,
      userId: user.uid,
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    // Fetch total episodes/chapters
    try {
      if (data.type === 'anime' && data.animeId) {
        const animeDetails = await firstValueFrom(this.animeService.getAnimeDetails(data.animeId));
        bookmarkData.totalEpisodes = animeDetails.data.episodes || null;
        bookmarkData.currentEpisode = 0;
        // Hapus field yang tidak relevan untuk anime
        delete bookmarkData.totalChapters;
        delete bookmarkData.currentChapter;
      } else if (data.type === 'manga' && data.mangaId) {
        const mangaDetails = await firstValueFrom(this.mangaService.getMangaDetails(data.mangaId));
        bookmarkData.totalChapters = mangaDetails.data.chapters || null;
        bookmarkData.currentChapter = 0;
        // Hapus field yang tidak relevan untuk manga
        delete bookmarkData.totalEpisodes;
        delete bookmarkData.currentEpisode;
      }
    } catch (error) {
      console.error('Error fetching details:', error);
      // Jika gagal mendapatkan detail, tetap lanjutkan dengan nilai null
      if (data.type === 'anime') {
        bookmarkData.totalEpisodes = null;
        bookmarkData.currentEpisode = 0;
        delete bookmarkData.totalChapters;
        delete bookmarkData.currentChapter;
      } else {
        bookmarkData.totalChapters = null;
        bookmarkData.currentChapter = 0;
        delete bookmarkData.totalEpisodes;
        delete bookmarkData.currentEpisode;
      }
    }

    // Bersihkan data undefined sebelum menyimpan ke Firestore
    Object.keys(bookmarkData).forEach(key => {
      if (bookmarkData[key] === undefined) {
        delete bookmarkData[key];
      }
    });

    const bookmarkId = `${data.type}-${data.type === 'anime' ? data.animeId : data.mangaId}`;
    const bookmarkRef = doc(this.firestore, `bookmarks/${user.uid}/items/${bookmarkId}`);
    
    await setDoc(bookmarkRef, bookmarkData);
  }

  // Remove bookmark
  async removeBookmark(type: 'anime' | 'manga', contentId: number): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('User must be logged in');

    const bookmarkId = `${type}-${contentId}`;
    const bookmarkRef = doc(this.firestore, `bookmarks/${user.uid}/items/${bookmarkId}`);
    await deleteDoc(bookmarkRef);
  }

  // Check if item is bookmarked
  async isBookmarked(type: 'anime' | 'manga', contentId: number): Promise<boolean> {
    const user = this.auth.currentUser;
    if (!user) return false;

    const bookmarkId = `${type}-${contentId}`;
    const bookmarkRef = doc(this.firestore, `bookmarks/${user.uid}/items/${bookmarkId}`);
    const bookmarkSnap = await getDoc(bookmarkRef);
    
    return bookmarkSnap.exists();
  }

  // Get all bookmarks for current user
  getUserBookmarks(): Observable<Bookmark[]> {
    const user = this.auth.currentUser;
    if (!user) return of([]);

    const bookmarksRef = collection(this.firestore, `bookmarks/${user.uid}/items`);
    return collectionData(bookmarksRef).pipe(
      map(bookmarks => bookmarks.map(bookmark => ({
        ...bookmark,
        createdAt: this.convertTimestampToDate(bookmark['createdAt']),
        lastUpdated: this.convertTimestampToDate(bookmark['lastUpdated'])
      })))
    ) as Observable<Bookmark[]>;
  }

  // Update getUserBookmarksByType to use collectionData for real-time updates
  getUserBookmarksByType(type: 'anime' | 'manga'): Observable<Bookmark[]> {
    const user = this.auth.currentUser;
    if (!user) return of([]);

    const bookmarksRef = collection(this.firestore, `bookmarks/${user.uid}/items`);
    const typeQuery = query(bookmarksRef, where('type', '==', type));
    return collectionData(typeQuery).pipe(
      map(bookmarks => bookmarks.map(bookmark => ({
        ...bookmark,
        createdAt: this.convertTimestampToDate(bookmark['createdAt']),
        lastUpdated: this.convertTimestampToDate(bookmark['lastUpdated'])
      })))
    ) as Observable<Bookmark[]>;
  }

  private convertTimestampToDate(timestamp: any): Date | null {
    if (!timestamp) return null;
    
    // Handle Firestore Timestamp
    if (timestamp.toDate) {
      return timestamp.toDate();
    }
    
    // Handle if it's already a Date object
    if (timestamp instanceof Date) {
      return timestamp;
    }
    
    // Handle if it's a timestamp number
    if (typeof timestamp === 'number') {
      return new Date(timestamp);
    }
    
    return null;
  }

  async updateProgress(
    type: 'anime' | 'manga',
    contentId: number,
    progress: number
  ): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('User must be logged in');

    const bookmarkId = `${type}-${contentId}`;
    const bookmarkRef = doc(this.firestore, `bookmarks/${user.uid}/items/${bookmarkId}`);
    
    const updateData: any = {
      lastUpdated: new Date()
    };

    if (type === 'anime') {
      updateData.currentEpisode = progress;
    } else {
      updateData.currentChapter = progress;
    }

    await setDoc(bookmarkRef, updateData, { merge: true });
  }
}