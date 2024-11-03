import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Profile', url: '/folder/profile', icon: 'person' },
    { title: 'Anime', url: '/anime', icon: 'play' },
    { title: 'Manga', url: '/folder/manga', icon: 'book' },
    { title: 'Bookmark', url: '/folder/bookmark', icon: 'bookmark' },
  ];
  constructor() {}
}
