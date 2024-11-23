// authentication.service.ts
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';

export interface User {
  uid: string;
  email: string;
  fullname: string;
  photoURL?: string;
  createdAt: Date;
  lastLoginAt?: Date;
  role?: string;
  // Tambahkan field lain sesuai kebutuhan
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore
  ) { }

  // Modifikasi method registerUser untuk menyimpan data user
  async registerUser(email: string, password: string, fullname: string): Promise<any> {
    try {
      // 1. Create authentication user
      const credential = await this.afAuth.createUserWithEmailAndPassword(email, password);
      
      if (credential.user) {
        // 2. Create user profile document in Firestore
        const userData: User = {
          uid: credential.user.uid,
          email: email,
          fullname: fullname,
          createdAt: new Date(),
          photoURL: '',
          lastLoginAt: new Date(),
          role: 'user',
        };

        // Simpan ke collection 'users' dengan document ID sama dengan UID
        await this.firestore.doc(`users/${credential.user.uid}`).set(userData);
        
        return credential;
      }
    } catch (error) {
      throw error;
    }
  }

  // Get user profile from Firestore
  getUserProfile(uid: string) {
    return this.firestore.doc<User>(`users/${uid}`).valueChanges();
  }

  // Update user profile
  async updateUserProfile(uid: string, data: Partial<User>) {
    return this.firestore.doc(`users/${uid}`).update(data);
  }

  // Existing methods...
  async loginUser(email: string, password: string) {
    const credential = await this.afAuth.signInWithEmailAndPassword(email, password);
    if (credential.user) {
      // Update last login
      await this.firestore.doc(`users/${credential.user.uid}`).update({
        lastLoginAt: new Date()
      });
    }
    return credential;
  }

  async resetPassword(email: string) {
    return await this.afAuth.sendPasswordResetEmail(email);
  }

  async signOut() {
    return await this.afAuth.signOut();
  }

  async getProfile() {
    const user = await this.afAuth.currentUser;
    if (user) {
      return this.getUserProfile(user.uid);
    }
    return null;
  }

  async logout() {
    return await this.afAuth.signOut();
  }
}