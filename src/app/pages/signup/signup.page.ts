import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  regForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    private authService: AuthenticationService,
    private router: Router,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    // Custom validator function for password
    const passwordValidator = (control: any) => {
      const value = control.value;

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const hasSpecialChar = /[!@#$%&*]/.test(value);
      const isLongEnough = value.length >= 8;

      const valid = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isLongEnough;

      if (!valid) {
        return { invalidPassword: true };
      }
      return null;
    };

    this.regForm = this.formBuilder.group({
      fullname: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        passwordValidator
      ]]
    });
  }

  get errorControl() {
    return this.regForm.controls;
  }

  async signUp() {
    if (!this.regForm.valid) {
      const alert = await this.alertController.create({
        header: 'Form Tidak Valid',
        message: 'Password harus memiliki minimal 8 karakter, 1 huruf besar, 1 huruf kecil, 1 angka, dan 1 karakter spesial (!@#$%&*)',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Mendaftarkan akun...'
    });
    await loading.present();

    try {
      const { email, password } = this.regForm.value;
      const user = await this.authService.registerUser(email, password);

      if (user) {
        await this.router.navigate(['/anime']);
      }
    } catch (error: unknown) {
      console.error('Registration error:', error);
      let errorMessage = 'Terjadi kesalahan saat mendaftar';

      // Type guard to check if error is an object with a 'code' property
      if (error instanceof Error && 'code' in error) {
        const authError = error as { code: string };

        switch (authError.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'Email sudah terdaftar';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Format email tidak valid';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password terlalu lemah';
            break;
        }
      }

      const alert = await this.alertController.create({
        header: 'Pendaftaran Gagal',
        message: errorMessage,
        buttons: ['OK']
      });
      await alert.present();
    } finally {
      await loading.dismiss();
    }
  }
}