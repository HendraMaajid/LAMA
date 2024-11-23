// app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Auth, User } from '@angular/fire/auth';
import { NavigationEnd, Router } from '@angular/router';
import { AlertController, MenuController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  public appPages: Array<{ title: string; url: string; icon: string }> = [
    { title: 'Anime', url: '/anime', icon: 'play' },
    { title: 'Manga', url: '/manga', icon: 'book' }
  ];
  public authenticatedPages: Array<{ title: string; url: string; icon: string }> = [
    { title: 'Profile', url: '/folder/profile', icon: 'person' },
    { title: 'Bookmark', url: '/folder/bookmark', icon: 'bookmark' },
    { title: 'News', url: '/news', icon: 'newspaper' }
  ];
  public isLoggedIn = false;
  public userProfile: User | null = null;
  public defaultPhotoURL = 'assets/wpdandan.jpg'; // Add a default avatar image

  private navigationSubscription: Subscription | null = null;
  private authSubscription: Subscription | null = null;

  constructor(
    private auth: Auth,
    private router: Router,
    private alertCtrl: AlertController,
    private menuCtrl: MenuController
  ) {}

  ngOnInit() {
    console.log('ngOnInit started');
    
    // Listen to authentication state
    this.authSubscription = new Subscription();
    this.authSubscription.add(
      this.auth.onAuthStateChanged((user) => {
        console.log('Auth State Changed:', {
          isUserNull: user === null,
          userData: {
            uid: user?.uid,
            email: user?.email,
            displayName: user?.displayName,
            photoURL: user?.photoURL,
            emailVerified: user?.emailVerified,
            phoneNumber: user?.phoneNumber,
            providerData: user?.providerData
          }
        });

        this.isLoggedIn = !!user;
        this.userProfile = user;
        
        // Log detail user profile setelah update
        console.log('Updated User Profile:', {
          isLoggedIn: this.isLoggedIn,
          displayName: this.getUserDisplayName(),
          photoURL: this.getUserPhotoURL(),
          actualPhotoURL: user?.photoURL,
          defaultPhotoURL: this.defaultPhotoURL
        });
      })
    );
  }

  ngOnDestroy() {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  // Get user's display name or email
  getUserDisplayName(): string {
    return this.userProfile?.displayName || this.userProfile?.email?.split('@')[0] || 'Guest';
  }

  // Get user's profile photo URL or default avatar
  getUserPhotoURL(): string {
    return this.userProfile?.photoURL || this.defaultPhotoURL;
  }

  // Fungsi untuk menampilkan konfirmasi logout
  async confirmLogout() {
    const alert = await this.alertCtrl.create({
      header: 'Konfirmasi Logout',
      message: 'Apakah Anda yakin ingin logout?',
      buttons: [
        {
          text: 'Batal',
          role: 'cancel',
        },
        {
          text: 'Logout',
          handler: () => this.logout(), // Panggil fungsi logout jika dikonfirmasi
        },
      ],
    });
    await alert.present();
  }

  // Fungsi untuk logout dari Firebase
  async logout() {
    try {
      await this.menuCtrl.close(); // Tutup side menu
      await this.auth.signOut();  // Logout dari Firebase
      this.router.navigateByUrl('/login', { replaceUrl: true }); // Arahkan ke login
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
}
