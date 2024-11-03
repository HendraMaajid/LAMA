// src/app/pages/anime-detail/anime-detail.page.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnimeService } from '../../services/anime.service';
import { LoadingController, ModalController } from '@ionic/angular';
import { EpisodeDetailComponent } from './episode-detail.component';

@Component({
  selector: 'app-anime-detail',
  templateUrl: './anime-detail.page.html',
  styleUrls: ['./anime-detail.page.scss'],
})
export class AnimeDetailPage implements OnInit {
  animeDetails: any;
  characters: any[] = [];
  episodes: any[] = [];
  isLoading = false;
  error = '';
  selectedSegment = 'info';

 constructor(
    private route: ActivatedRoute,
    private animeService: AnimeService,
    private loadingController: LoadingController,
    private modalController: ModalController  // Add this
  ) { }

  ngOnInit() {
    const animeId = this.route.snapshot.paramMap.get('id');
    if (animeId) {
      this.loadAnimeDetails(parseInt(animeId));
      this.animeEpisodes(parseInt(animeId));
    }
  }

  async loadAnimeDetails(id: number) {
    const loading = await this.loadingController.create({
      message: 'Memuat detail anime...'
    });
    await loading.present();

    this.animeService.getAnimeDetails(id).subscribe({
      next: (response) => {
        this.animeDetails = response.data;
        this.loadCharacters(id);
      },
      error: (error) => {
        this.error = 'Gagal memuat detail anime';
        console.error('Error:', error);
        loading.dismiss();
      }
    });
  }

  loadCharacters(id: number) {
    this.animeService.getAnimeCharacters(id).subscribe({
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

  animeEpisodes(id: number) {
    this.animeService.getAnimeEpisodes(id).subscribe({
      next: (response) => {
        this.episodes = response.data;
        console.log(response);
      },
      error: (error) => {
        console.error('Error:', error);
      }
    });
  }

  async showEpisodeDetail(animeId: number, episodeNumber: number) {
    const loading = await this.loadingController.create({
      message: 'Loading episode details...'
    });
    await loading.present();

    this.animeService.getAnimeEpisodesbyId(animeId, episodeNumber).subscribe({
      next: async (response) => {
        loading.dismiss();
        const modal = await this.modalController.create({
          component: EpisodeDetailComponent,
          componentProps: {
            episode: response.data
          }
        });
        await modal.present();
      },
      error: (error) => {
        loading.dismiss();
        console.error('Error:', error);
      }
    });
  }

  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  }
}