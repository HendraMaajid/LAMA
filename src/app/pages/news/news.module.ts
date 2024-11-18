// news.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { QuillModule } from 'ngx-quill';
import { NewsPageRoutingModule } from './news-routing.module';
import { NewsPage } from './news.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    NewsPageRoutingModule,
    QuillModule.forRoot() // Add this line
  ],
  declarations: [NewsPage]
})
export class NewsPageModule {}