import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import firebase from 'firebase/compat/app';
import { AuthenticationService } from './authentication.service';
import { User } from './authentication.service'; // Import User interface

export interface ForumPost {
  id?: string;
  animeId: number;
  content: string;
  userId: string;
  username: string;
  userPhotoURL?: string;
  createdAt: firebase.firestore.Timestamp;
}

export interface Reply {
  id?: string;
  postId: string;
  userId: string;
  username: string;
  userPhotoURL?: string;
  content: string;
  createdAt: any;
}

@Injectable({
  providedIn: 'root'
})
export class ForumAnimeService {
  constructor(
    private firestore: AngularFirestore,
    private authService: AuthenticationService
  ) {}

  getForumPosts(animeId: number): Observable<ForumPost[]> {
    return this.firestore.collection<ForumPost>('forum_anime', 
      ref => ref.where('animeId', '==', animeId)
                .orderBy('createdAt', 'desc')
    ).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  async createForumPost(postData: { animeId: number, content: string }): Promise<ForumPost> {
  const user = await this.authService.getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const userProfile = await this.firestore.doc<User>(`users/${user.uid}`).get().toPromise();
  const userData = userProfile?.data();

  const post: ForumPost = {
    animeId: postData.animeId,
    content: postData.content,
    userId: user.uid,
    username: userData?.fullname || user.email || 'Anonymous',
    userPhotoURL: userData?.photoURL || '', // Change this line
    createdAt: firebase.firestore.Timestamp.now()
  };

  const docRef = await this.firestore.collection('forum_anime').add(post);
  return { id: docRef.id, ...post };
}

async updateForumPost(postId: string, content: string): Promise<void> {
    const user = await this.authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    return this.firestore.doc(`forum_anime/${postId}`).update({
      content,
      updatedAt: firebase.firestore.Timestamp.now()
    });
  }

  async deleteForumPost(postId: string): Promise<void> {
    const user = await this.authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    return this.firestore.doc(`forum_anime/${postId}`).delete();
  }

  getCurrentUserId(): Observable<string | null> {
    return this.authService.getAuthState().pipe(
      map(user => user?.uid || null)
    );
  }

  async canModifyPost(postId: string): Promise<boolean> {
    const user = await this.authService.getCurrentUser();
    if (!user) return false;

    const postDoc = await this.firestore.doc(`forum_anime/${postId}`).get().toPromise();
    const postData = postDoc?.data() as ForumPost | undefined;
    return postData?.userId === user.uid;
  }

   // Get replies for a specific post
  getReplies(postId: string): Observable<Reply[]> {
    return this.firestore.collection<Reply>(`forum_anime/${postId}/replies`,
      ref => ref.orderBy('createdAt', 'asc')
    ).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  // Create a new reply
  async createReply(postId: string, content: string): Promise<Reply> {
    const user = await this.authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const userProfile = await this.firestore.doc<User>(`users/${user.uid}`).get().toPromise();
    const userData = userProfile?.data();

    const reply: Reply = {
      postId: postId,
      content: content,
      userId: user.uid,
      username: userData?.fullname || user.email || 'Anonymous',
      userPhotoURL: userData?.photoURL || '',
      createdAt: firebase.firestore.Timestamp.now()
    };

    const docRef = await this.firestore.collection(`forum_anime/${postId}/replies`).add(reply);
    return { id: docRef.id, ...reply };
  }

  // Delete a reply
  async deleteReply(postId: string, replyId: string): Promise<void> {
    const user = await this.authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    return this.firestore.doc(`forum_anime/${postId}/replies/${replyId}`).delete();
  }

  // Check if user can modify a reply
  async canModifyReply(postId: string, replyId: string): Promise<boolean> {
    const user = await this.authService.getCurrentUser();
    if (!user) return false;

    const replyDoc = await this.firestore.doc(`forum_anime/${postId}/replies/${replyId}`).get().toPromise();
    const replyData = replyDoc?.data() as Reply | undefined;
    return replyData?.userId === user.uid;
  }

  
}