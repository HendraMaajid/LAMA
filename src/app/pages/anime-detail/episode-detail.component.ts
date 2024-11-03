import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-episode-detail',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Episode Detail</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>{{ episode.title }}</ion-card-title>
          <ion-card-subtitle>Episode {{ episode.mal_id }}</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <p><strong>Aired:</strong> {{ episode.aired | date:'yyyy-MM-dd' }}</p>
          <p><strong>Score:</strong> {{ episode.score }}</p>
          <p><strong>Filler:</strong> {{ episode.filler ? 'Yes' : 'No' }}</p>
          <p><strong>Recap:</strong> {{ episode.recap ? 'Yes' : 'No' }}</p>
          <div *ngIf="episode.synopsis">
            <h3><strong>Synopsis:</strong></h3>
            <p>{{ episode.synopsis }}</p>
          </div>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `
})
export class EpisodeDetailComponent {
  @Input() episode: any;

  constructor(private modalController: ModalController) {}

  dismiss() {
    this.modalController.dismiss();
  }
}