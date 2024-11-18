import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'anime',
    pathMatch: 'full'
  },
  {
    path: 'folder/:id',
    loadChildren: () => import('./folder/folder.module').then( m => m.FolderPageModule)
  },
  {
    path: 'anime',
    loadChildren: () => import('./anime/anime.module').then( m => m.AnimePageModule)
  },
  {
  path: 'anime/:id',
    loadChildren: () => import('./pages/anime-detail/anime-detail.module').then(m => m.AnimeDetailPageModule)
  },
  {
    path: 'manga',
    loadChildren: () => import('./manga/manga.module').then( m => m.MangaPageModule)
  },
  {
    path: 'manga/:id',
    loadChildren: () => import('./pages/manga-detail/manga-detail.module').then(m => m.MangaDetailModule)
  },
  {
    path: 'news',
    loadChildren: () => import('./pages/news/news.module').then( m => m.NewsPageModule)
  },


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
