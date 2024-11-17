// news.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface NewsItem {
  id?: string;
  title: string;
  content: string;
  imageUrl: string;
  date: any; // bisa menggunakan firebase.firestore.Timestamp atau Date
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  constructor(private firestore: AngularFirestore) {}

  // Mendapatkan semua berita
  getAllNews(): Observable<NewsItem[]> {
  return this.firestore.collection<NewsItem>('news', ref => 
    ref.orderBy('date', 'desc'))
    .snapshotChanges()
    .pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as NewsItem;
        const id = a.payload.doc.id;
        // Konversi Timestamp ke Date
        return { 
          id, 
          ...data,
          date: data.date?.toDate() // Konversi Timestamp ke JavaScript Date
        };
      }))
    );
  }

  // Mendapatkan berita berdasarkan ID
  getNewsById(id: string): Observable<NewsItem | undefined> {
    return this.firestore.doc<NewsItem>(`news/${id}`).valueChanges().pipe(
      map(news => {
        if (news) {
          return { id, ...news };
        }
        return undefined;
      })
    );
  }

  // Menambah berita baru
  addNews(news: NewsItem): Promise<any> {
    return this.firestore.collection('news').add({
      ...news,
      date: new Date() // Ini akan otomatis dikonversi ke Timestamp oleh Firebase
    });
  }

  // Mengupdate berita
  updateNews(id: string, news: Partial<NewsItem>): Promise<void> {
    return this.firestore.doc(`news/${id}`).update(news);
  }

  // Menghapus berita
  deleteNews(id: string): Promise<void> {
    return this.firestore.doc(`news/${id}`).delete();
  }
}