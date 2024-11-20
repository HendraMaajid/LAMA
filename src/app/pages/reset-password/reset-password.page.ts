import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage implements OnInit {
  email: string = '';
  emailError: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private alertController: AlertController,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() { }

  async resetPassword() {
    if (!this.email) {
      this.emailError = 'Email harus diisi';
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Mengirim tautan reset password...',
    });
    await loading.present();

    this.authService.resetPassword(this.email)
      .then(async () => {
        await loading.dismiss();
        const alert = await this.alertController.create({
          header: 'Sukses',
          message: 'Tautan reset password telah dikirim ke email Anda.',
          buttons: ['OK'],
        });
        await alert.present();
        this.router.navigate(['/login']);
      })
      .catch(async (error) => {
        await loading.dismiss();
        let errorMessage = 'Terjadi kesalahan, silakan coba lagi.';

        if (error.code === 'auth/user-not-found') {
          errorMessage = 'Pengguna tidak ditemukan dengan email tersebut.';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Format email tidak valid.';
        }

        const alert = await this.alertController.create({
          header: 'Gagal',
          message: errorMessage,
          buttons: ['OK'],
        });
        await alert.present();
      });
  }
}