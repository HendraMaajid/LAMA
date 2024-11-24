import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, LoadingController, ToastController } from '@ionic/angular';
import { AuthenticationService, User } from '../../services/authentication.service';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss']
})
export class EditProfilePage implements OnInit {
  @Input() user!: User;
  profileForm: FormGroup;
  currentPhotoURL: string | null = null;
  defaultPhotoURL = 'assets/wpdandan.jpg';
  selectedFile: File | null = null;

  constructor(
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private authService: AuthenticationService,
    private supabaseService: SupabaseService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    this.profileForm = this.formBuilder.group({
      fullname: ['', Validators.required],
      email: [{ value: '', disabled: true }]
    });
  }

  ngOnInit() {
    if (this.user) {
      this.profileForm.patchValue({
        fullname: this.user.fullname,
        email: this.user.email
      });
      this.currentPhotoURL = this.user.photoURL || this.defaultPhotoURL;
    }
  }

  async selectImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (event: any) => {
      const file = event.target.files?.[0];
      if (file) {
        this.selectedFile = file;
        // Preview image
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.currentPhotoURL = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  }

  async saveProfile() {
    if (this.profileForm.invalid || !this.user) {
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Updating profile...'
    });
    await loading.present();

    try {
      let imageUrl = this.user.photoURL;

      // Upload new image if selected
      if (this.selectedFile) {
        imageUrl = await this.supabaseService.uploadImageProfile(this.selectedFile);
      }

      // Update user profile in Firestore
      await this.authService.updateUserProfile(this.user.uid, {
        fullname: this.profileForm.get('fullname')?.value,
        photoURL: imageUrl
      });

      const toast = await this.toastCtrl.create({
        message: 'Profile updated successfully',
        duration: 2000,
        color: 'success'
      });
      await toast.present();

      this.modalCtrl.dismiss({
        updated: true
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      const toast = await this.toastCtrl.create({
        message: 'Error updating profile',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      await loading.dismiss();
    }
  }

  dismissModal() {
    this.modalCtrl.dismiss();
  }
}