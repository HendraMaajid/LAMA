import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    private authService: AuthenticationService,
    private router: Router,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.initializeForm();
  }

  ionViewWillEnter() {
    // Reset form setiap kali halaman login dikunjungi
    this.initializeForm();
  }

  private initializeForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern("[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$")
      ]],
      password: ['', [
        Validators.required,
        Validators.pattern("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$")
      ]]
    });
  }

  get errorControl() {
    return this.loginForm.controls;
  }

  async login() {
    if (!this.loginForm.valid) {
      const alert = await this.alertController.create({
        header: 'Form Tidak Valid',
        message: 'Silakan periksa kembali email dan password Anda.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Memproses login...'
    });
    await loading.present();

    try {
      const { email, password } = this.loginForm.value;
      const user = await this.authService.loginUser(email, password);

      if (user) {
        await this.router.navigate(['/anime']);
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      let errorMessage = 'Terjadi kesalahan saat login';

      // Type guard to check if error is an object with a 'code' property
      if (error instanceof Error && 'code' in error) {
        const authError = error as { code: string };

        switch (authError.code) {
          case 'auth/user-not-found':
            errorMessage = 'Pengguna tidak ditemukan';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Password salah';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Format email tidak valid';
            break;
        }
      }

      const alert = await this.alertController.create({
        header: 'Login Gagal',
        message: errorMessage,
        buttons: ['OK']
      });
      await alert.present();
    } finally {
      await loading.dismiss();
    }
  }
}
