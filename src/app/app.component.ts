import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AlertController, MenuController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Profile', url: '/folder/profile', icon: 'person' },
    { title: 'Anime', url: '/anime', icon: 'play' },
    { title: 'Manga', url: '/manga', icon: 'book' },
    { title: 'Bookmark', url: '/folder/bookmark', icon: 'bookmark' },
    { title: 'News', url: '/news', icon: 'newspaper' },
  ];

  constructor(
    private auth: Auth,
    private router: Router,
    private alertCtrl: AlertController,
    private menuCtrl: MenuController // Tambahkan ini
  ) { }

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
