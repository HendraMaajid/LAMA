// src/app/pages/manga-detail/manga-detail.page.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MangaService } from '../../services/manga.service';
import { LoadingController, ModalController } from '@ionic/angular';


@Component({
  selector: 'app-manga-detail',
  templateUrl: './manga-detail.page.html',
  styleUrls: ['./manga-detail.page.scss'],
})
export class MangaDetailPage implements OnInit {
  mangaDetails: any;
  characters: any[] = [];
  episodes: any[] = [];
  isLoading = false;
  error = '';
  selectedSegment = 'info';

 constructor(
    private route: ActivatedRoute,
    private mangaService: MangaService,
    private loadingController: LoadingController,
    private modalController: ModalController  // Add this
  ) { }

  ngOnInit() {
    const mangaId = this.route.snapshot.paramMap.get('id');
    if (mangaId) {
      this.loadMangaDetails(parseInt(mangaId));
    }
  }

  async loadMangaDetails(id: number) {
    const loading = await this.loadingController.create({
      message: 'Memuat detail manga...'
    });
    await loading.present();

    this.mangaService.getMangaDetails(id).subscribe({
      next: (response) => {
        this.mangaDetails = response.data;
        this.loadCharacters(id);
      },
      error: (error) => {
        this.error = 'Gagal memuat detail manga';
        console.error('Error:', error);
        loading.dismiss();
      }
    });
  }

  loadCharacters(id: number) {
    this.mangaService.getMangaCharacters(id).subscribe({
      next: (response) => {
        this.characters = response.data;
        this.loadingController.dismiss();
      },
      error: (error) => {
        this.error = 'Gagal memuat karakter';
        console.error('Error:', error);
        this.loadingController.dismiss();
      }
    });
  }

  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  }
}