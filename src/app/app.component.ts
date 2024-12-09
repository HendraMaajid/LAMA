import { Component, OnInit, OnDestroy } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { NavigationEnd, Router } from '@angular/router';
import { AlertController, MenuController, ModalController } from '@ionic/angular';
import { Subscription, Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { AuthenticationService, User } from './services/authentication.service';
import { SupabaseService } from './services/supabase.service';
import { EditProfilePage } from './components/edit-profile/edit-profile.page';

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
    { title: 'Bookmark', url: '/bookmarks', icon: 'bookmark' },
    { title: 'News', url: '/news', icon: 'newspaper' }
  ];
  public isLoggedIn = false;
  public userProfile: User | null = null;
  public defaultPhotoURL = 'assets/wpdandan.jpg';

  private subscriptions = new Subscription();

  constructor(
    private auth: Auth,
    private router: Router,
    private alertCtrl: AlertController,
    private menuCtrl: MenuController,
    private modalCtrl: ModalController,
    private authService: AuthenticationService,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit() {
    console.log('ngOnInit started');
    
    // Subscribe to auth state and get Firestore user data
    this.subscriptions.add(
      this.auth.onAuthStateChanged((firebaseUser) => {
        console.log('Auth State Changed:', {
          isUserNull: firebaseUser === null,
          firebaseUID: firebaseUser?.uid
        });

        this.isLoggedIn = !!firebaseUser;

        if (firebaseUser) {
          // Get user data from Firestore
          this.subscriptions.add(
            this.authService.getUserProfile(firebaseUser.uid).subscribe(
              (firestoreUser) => {
                if (firestoreUser) {
                  this.userProfile = firestoreUser;
                  console.log('Firestore User Data:', this.userProfile);
                } else {
                  console.log('No Firestore user data found');
                  this.userProfile = null;
                }
              },
              (error) => {
                console.error('Error fetching Firestore user data:', error);
                this.userProfile = null;
              }
            )
          );
        } else {
          this.userProfile = null;
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // Get user's display name or email
  getUserDisplayName(): string {
    return this.userProfile?.fullname || this.userProfile?.email?.split('@')[0] || 'Guest';
  }

  // Get user's profile photo URL or default avatar
  getUserPhotoURL(): string {
    return this.userProfile?.photoURL || this.defaultPhotoURL;
  }

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
          handler: () => this.logout(),
        },
      ],
    });
    await alert.present();
  }

  async logout() {
    try {
      await this.menuCtrl.close();
      await this.authService.logout(); // Using AuthenticationService logout
      this.router.navigateByUrl('/login', { replaceUrl: true });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  async openEditProfile() {
    const modal = await this.modalCtrl.create({
      component: EditProfilePage,
      componentProps: {
        user: this.userProfile
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.updated) {
      // Profile was updated, refresh the user data
      this.refreshUserProfile();
    }
  }

  private refreshUserProfile() {
    if (this.auth.currentUser) {
      this.authService.getUserProfile(this.auth.currentUser.uid).subscribe(
        (userData) => {
          if (userData) {
            this.userProfile = userData;
          } else {
            this.userProfile = null;
          }
        },
        (error) => {
          console.error('Error fetching user profile:', error);
          this.userProfile = null;
        }
      );
    }
  }
}