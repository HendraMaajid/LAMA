import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MangaPageRoutingModule } from './manga-routing.module';

import { MangaPage } from './manga.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MangaPageRoutingModule
  ],
  declarations: [MangaPage]
})
export class MangaPageModule {}
