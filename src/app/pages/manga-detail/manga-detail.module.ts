import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MangaDetailRoutingModule } from './manga-detail-routing.module';
import { MangaDetailPage } from './manga-detail.page';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

const routes: Routes = [
  {
    path: '',
    component: MangaDetailPage
  }
];

@NgModule({
  declarations: [
    MangaDetailPage,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ]
})
export class MangaDetailModule { }
