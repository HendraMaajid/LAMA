import { Component, OnInit } from '@angular/core';
import { BookmarkService, Bookmark } from '../../services/bookmark.service';
import { Observable } from 'rxjs';
import { ToastController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bookmarks',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>My Bookmarks</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment [(ngModel)]="selectedType" (ionChange)="segmentChanged($event)">
          <ion-segment-button value="all">
            <ion-label>All</ion-label>
          </ion-segment-button>
          <ion-segment-button value="anime">
            <ion-label>Anime</ion-label>
          </ion-segment-button>
          <ion-segment-button value="manga">
            <ion-label>Manga</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item *ngFor="let bookmark of bookmarks$ | async" button (click)="goToDetail(bookmark)">
          <ion-thumbnail slot="start">
            <img [src]="bookmark.imageUrl" [alt]="bookmark.title">
          </ion-thumbnail>
          <ion-label>
            <h2>{{ bookmark.title }}</h2>
            <p>{{ bookmark.type | titlecase }}</p>
            <p *ngIf="bookmark.type === 'anime'">
              Episode: {{ bookmark.currentEpisode }}/{{ bookmark.totalEpisodes || '?' }}
            </p>
            <p *ngIf="bookmark.type === 'manga'">
              Chapter: {{ bookmark.currentChapter }}/{{ bookmark.totalChapters || '?' }}
            </p>
            <p class="text-small">
              Last updated: {{ bookmark.lastUpdated | date:'short' }}
            </p>
          </ion-label>
          
          <!-- Progress Update Button -->
          <ion-button slot="end" fill="clear" (click)="updateProgress(bookmark); $event.stopPropagation()">
            <ion-icon name="add-circle-outline"></ion-icon>
          </ion-button>
          
          <!-- Delete Button -->
          <ion-button slot="end" fill="clear" (click)="confirmDelete(bookmark); $event.stopPropagation()">
            <ion-icon name="trash-outline" color="danger"></ion-icon>
          </ion-button>
        </ion-item>

        <!-- ... existing no bookmarks message ... -->
        <ion-item *ngIf="(bookmarks$ | async)?.length === 0" lines="none">
          <ion-label class="ion-text-center">
            <p>No bookmarks found</p>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  `
})
export class BookmarksPage implements OnInit {
  bookmarks$: Observable<Bookmark[]> = this.bookmarkService.getUserBookmarks();
  selectedType: 'all' | 'anime' | 'manga' = 'all';

  constructor(
    private bookmarkService: BookmarkService,
    private toastController: ToastController,
    private alertController: AlertController,
    private router: Router  // Add this

  ) {
    this.loadBookmarks();
  }

  ngOnInit() {}

  loadBookmarks() {
    if (this.selectedType === 'all') {
      this.bookmarks$ = this.bookmarkService.getUserBookmarks();
    } else {
      this.bookmarks$ = this.bookmarkService.getUserBookmarksByType(this.selectedType);
    }
  }

  segmentChanged(event: any) {
    this.selectedType = event.detail.value;
    this.loadBookmarks();
  }

  async confirmDelete(bookmark: Bookmark) {
    const alert = await this.alertController.create({
      header: 'Confirm Deletion',
      message: `Are you sure you want to remove "${bookmark.title}" from your bookmarks?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.removeBookmark(bookmark);
          }
        }
      ]
    });

    await alert.present();
  }

  goToDetail(bookmark: Bookmark): void {
    if (bookmark.type === 'anime' && bookmark.animeId) {
      this.router.navigate(['/anime', bookmark.animeId]);
    } else if (bookmark.type === 'manga' && bookmark.mangaId) {
      this.router.navigate(['/manga', bookmark.mangaId]);
    }
  }

  async removeBookmark(bookmark: Bookmark) {
    try {
      if (bookmark.animeId) {
        await this.bookmarkService.removeBookmark('anime', bookmark.animeId);
      } else if (bookmark.mangaId) {
        await this.bookmarkService.removeBookmark('manga', bookmark.mangaId);
      }

      // Reload the bookmarks
      this.loadBookmarks();

      // Show success toast
      const toast = await this.toastController.create({
        message: `${bookmark.title} has been removed from bookmarks`,
        duration: 2000,
        position: 'top',
        color: 'success',
        buttons: [
          {
            text: 'Close',
            role: 'cancel'
          }
        ]
      });
      await toast.present();
    } catch (error) {
      // Show error toast
      const toast = await this.toastController.create({
        message: 'Failed to remove bookmark',
        duration: 2000,
        position: 'top',
        color: 'danger',
        buttons: [
          {
            text: 'Close',
            role: 'cancel'
          }
        ]
      });
      await toast.present();
    }
  }
  async updateProgress(bookmark: Bookmark) {
    const alert = await this.alertController.create({
      header: `Update ${bookmark.type === 'anime' ? 'Episode' : 'Chapter'}`,
      inputs: [
        {
          name: 'progress',
          type: 'number',
          placeholder: `Current ${bookmark.type === 'anime' ? 'episode' : 'chapter'}`,
          value: bookmark.type === 'anime' ? bookmark.currentEpisode : bookmark.currentChapter
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Update',
          handler: async (data) => {
            try {
              const progress = parseInt(data.progress);
              if (isNaN(progress) || progress < 0) {
                throw new Error('Invalid progress value');
              }

              await this.bookmarkService.updateProgress(
                bookmark.type,
                bookmark.type === 'anime' ? bookmark.animeId! : bookmark.mangaId!,
                progress
              );

              const toast = await this.toastController.create({
                message: 'Progress updated successfully',
                duration: 2000,
                position: 'top',
                color: 'success'
              });
              await toast.present();
            } catch (error) {
              const toast = await this.toastController.create({
                message: 'Failed to update progress',
                duration: 2000,
                position: 'top',
                color: 'danger'
              });
              await toast.present();
            }
          }
        }
      ]
    });

    await alert.present();
  }
}