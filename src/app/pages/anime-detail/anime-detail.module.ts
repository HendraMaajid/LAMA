// src/app/pages/anime-detail/anime-detail.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { AnimeDetailPage } from './anime-detail.page';
import { EpisodeDetailComponent } from './episode-detail.component';

const routes: Routes = [
  {
    path: '',
    component: AnimeDetailPage
  }
];

@NgModule({
  declarations: [
    AnimeDetailPage,
    EpisodeDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ]
})
export class AnimeDetailPageModule { }