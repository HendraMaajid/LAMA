// news-detail.page.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NewsService, NewsItem } from '../../services/news.service';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-news-detail',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/news"></ion-back-button>
        </ion-buttons>
        <ion-title>News Detail</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content color="dark">
      <ion-card *ngIf="newsItem">
        <img [src]="newsItem.imageUrl" [alt]="newsItem.title"/>
        
        <ion-card-header>
          <ion-chip [color]="getCategoryColor(newsItem.category)">
            <ion-label>{{ newsItem.category }}</ion-label>
          </ion-chip>
          <ion-card-title>{{ newsItem.title }}</ion-card-title>
          <ion-card-subtitle>
            {{ formatDate(newsItem.date) }}
          </ion-card-subtitle>
        </ion-card-header>

        <ion-card-content>
          <div class="news-content">
            {{ newsItem.content }}
          </div>
        </ion-card-content>
      </ion-card>

      <div *ngIf="!newsItem" class="ion-padding ion-text-center">
        <ion-spinner></ion-spinner>
        <p>Loading news...</p>
      </div>

      <ion-item *ngIf="error" color="danger">
        <ion-icon name="alert-circle" slot="start"></ion-icon>
        <ion-label>{{ error }}</ion-label>
      </ion-item>
    </ion-content>
  `,
  styles: [`
    .news-content {
      line-height: 1.6;
      font-size: 16px;
      white-space: pre-wrap;
    }

    ion-card-title {
      font-size: 24px;
      font-weight: bold;
      margin: 16px 0;
    }

    ion-card img {
      width: 100%;
      height: 300px;
      object-fit: cover;
    }

    ion-chip {
      margin: 16px 0;
    }
  `]
})
export class NewsDetailPage implements OnInit {
  newsItem?: NewsItem;
  error?: string;

  constructor(
    private route: ActivatedRoute,
    private newsService: NewsService,
    private loadingController: LoadingController
  ) {}

  async ngOnInit() {
    const loading = await this.loadingController.create({
      message: 'Loading news...'
    });
    await loading.present();

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'News ID not found';
      await loading.dismiss();
      return;
    }

    this.newsService.getNewsById(id).subscribe(
      async (news) => {
        if (news) {
          this.newsItem = news;
        } else {
          this.error = 'News not found';
        }
        await loading.dismiss();
      },
      async (error) => {
        console.error('Error fetching news:', error);
        this.error = 'Failed to load news';
        await loading.dismiss();
      }
    );
  }

  formatDate(date: any): string {
    if (!date) return '';
    
    // Jika date adalah Timestamp dari Firestore
    if (date && typeof date.toDate === 'function') {
      return date.toDate().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // Jika date sudah dalam bentuk Date
    if (date instanceof Date) {
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // Jika format lain, konversi ke Date
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getCategoryColor(category: string): string {
    switch (category.toLowerCase()) {
      case 'anime':
        return 'primary';
      case 'manga':
        return 'secondary';
      case 'general':
        return 'tertiary';
      default:
        return 'medium';
    }
  }
}