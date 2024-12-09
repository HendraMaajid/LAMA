// src/app/services/bookmark.service.ts
import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore, collection, doc,  setDoc, deleteDoc, query, where, getDocs,getDoc, collectionData} from '@angular/fire/firestore';
import { Observable, from, map, of } from 'rxjs';

export interface Bookmark {
  id?: string;
  userId: string;
  animeId?: number;
  mangaId?: number;
  title: string;
  imageUrl: string;
  type: 'anime' | 'manga';
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class BookmarkService {
  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {}

  // Add bookmark
  async addBookmark(data: Omit<Bookmark, 'userId' | 'createdAt'>): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('User must be logged in to bookmark');

    const bookmarkData: Bookmark = {
      ...data,
      userId: user.uid,
      createdAt: new Date()
    };

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
    return collectionData(bookmarksRef) as Observable<Bookmark[]>;
  }

  // Update getUserBookmarksByType to use collectionData for real-time updates
  getUserBookmarksByType(type: 'anime' | 'manga'): Observable<Bookmark[]> {
    const user = this.auth.currentUser;
    if (!user) return of([]);

    const bookmarksRef = collection(this.firestore, `bookmarks/${user.uid}/items`);
    const typeQuery = query(bookmarksRef, where('type', '==', type));
    return collectionData(typeQuery) as Observable<Bookmark[]>;
  }
}