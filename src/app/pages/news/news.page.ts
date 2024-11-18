// news.page.ts
import { Component, OnInit } from '@angular/core';
import { NewsService, NewsItem } from '../../services/news.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-news',
  styleUrls: ['./news.page.scss'],
  template: `
    <ion-header>
      <ion-toolbar>
      <ion-buttons slot="start">
        <ion-menu-button></ion-menu-button>
      </ion-buttons>
        <ion-title>News</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="openNewsForm()">
            <ion-icon name="add"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- List Berita -->
      <ion-list>
          <ion-card *ngFor="let news of newsList" >
            <img alt="Silhouette of mountains" src="{{news.imageUrl}}" />
            <ion-card-header>
              <ion-card-title>{{ news.title }}</ion-card-title>
              <ion-card-subtitle>{{ news.category }}</ion-card-subtitle>
            </ion-card-header>

            <ion-card-content>
              <p>{{ news.content }}</p>
            </ion-card-content>
            <ion-button fill="clear" class="action-button" color="primary" (click)="openNewsForm(news)">Edit</ion-button>
            <ion-button fill="clear" class="action-button" color="danger" (click)="confirmDelete(news)">Hapus</ion-button>
          </ion-card>
      </ion-list>

      <!-- Form Modal -->
      <ion-modal [isOpen]="isModalOpen">
        <ng-template>
          <ion-header>
            <ion-toolbar>
              <ion-title>{{ editingNews ? 'Edit News' : 'Add News' }}</ion-title>
              <ion-buttons slot="end">
                <ion-button (click)="closeNewsForm()">Close</ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>

          <ion-content>
            <form [formGroup]="newsForm" (ngSubmit)="saveNews()">
              <ion-item>
                <ion-label position="stacked">Title</ion-label>
                <ion-input formControlName="title" type="text"></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Content</ion-label>
                <ion-textarea formControlName="content" rows="6"></ion-textarea>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Image URL</ion-label>
                <ion-input formControlName="imageUrl" type="text"></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Category</ion-label>
                <ion-select formControlName="category">
                  <ion-select-option value="anime">Anime</ion-select-option>
                  <ion-select-option value="manga">Manga</ion-select-option>
                  <ion-select-option value="general">General</ion-select-option>
                </ion-select>
              </ion-item>

              <ion-button expand="block" type="submit" [disabled]="!newsForm.valid">
                {{ editingNews ? 'Update' : 'Save' }}
              </ion-button>
            </form>
          </ion-content>
        </ng-template>
      </ion-modal>
    </ion-content>
  `
})
export class NewsPage implements OnInit {
  newsList: NewsItem[] = [];
  newsForm: FormGroup;
  isModalOpen = false;
  editingNews: NewsItem | null = null;

  constructor(
    private newsService: NewsService,
    private fb: FormBuilder,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    this.newsForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      imageUrl: ['', Validators.required],
      category: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadNews();
  }

  loadNews() {
    this.newsService.getAllNews().subscribe(news => {
      this.newsList = news;
    });
  }

  async openNewsForm(news?: NewsItem) {
    this.editingNews = news || null;
    if (news) {
      this.newsForm.patchValue(news);
    } else {
      this.newsForm.reset();
    }
    this.isModalOpen = true;
  }

  closeNewsForm() {
    this.isModalOpen = false;
    this.editingNews = null;
    this.newsForm.reset();
  }

  async saveNews() {
    if (this.newsForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Saving...'
      });
      await loading.present();

      try {
        if (this.editingNews) {
          await this.newsService.updateNews(this.editingNews.id!, this.newsForm.value);
        } else {
          await this.newsService.addNews(this.newsForm.value);
        }
        this.closeNewsForm();
      } catch (error) {
        console.error('Error saving news:', error);
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'Failed to save news. Please try again.',
          buttons: ['OK']
        });
        await alert.present();
      } finally {
        await loading.dismiss();
      }
    }
  }

  async confirmDelete(news: NewsItem) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this news?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Deleting...'
            });
            await loading.present();

            try {
              await this.newsService.deleteNews(news.id!);
            } catch (error) {
              console.error('Error deleting news:', error);
              const errorAlert = await this.alertController.create({
                header: 'Error',
                message: 'Failed to delete news. Please try again.',
                buttons: ['OK']
              });
              await errorAlert.present();
            } finally {
              await loading.dismiss();
            }
          }
        }
      ]
    });

    await alert.present();
  }
}