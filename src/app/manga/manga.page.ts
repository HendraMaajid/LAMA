import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MangaService } from '../services/manga.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
@Component({
  selector: 'app-manga',
  templateUrl: './manga.page.html',
  styleUrls: ['./manga.page.scss'],
})
export class MangaPage implements OnInit {
mangaList: any[] = [];
  isLoading: boolean = false;
  error: string = '';
  
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  constructor(
    private mangaService: MangaService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadPopularAnime();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  private setupSearch(): void {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(500), // Menunggu 500ms setelah user berhenti mengetik
      distinctUntilChanged() // Hanya melakukan request jika query berubah
    ).subscribe(query => {
      if (query.length >= 3) { // Minimal 3 karakter untuk mencari
        this.performSearch(query);
      } else if (query.length === 0) {
        this.loadPopularAnime(); // Kembali ke daftar populer jika search kosong
      }
    });
  }
  
  goToMangaDetail(mangaId: number) {
    this.router.navigate(['/manga', mangaId]);
  }

  loadPopularAnime(): void {
    this.isLoading = true;
    this.mangaService.getPopularManga().subscribe({
      next: (response) => {
        this.mangaList = response.data;
        this.isLoading = false;
      },
      error: (err: Error) => {
        this.error = 'Gagal memuat data anime';
        this.isLoading = false;
        console.error('Error:', err);
      }
    });
  }

  // Method ini dipanggil saat user mengetik
  onSearchInput(event: CustomEvent): void {
    const query = event.detail.value?.trim() || '';
    this.searchSubject.next(query);
  }

  private performSearch(query: string): void {
    this.isLoading = true;
    this.mangaService.searchManga(query).subscribe({
      next: (response) => {
        this.mangaList = response.data;
        this.isLoading = false;
      },
      error: (err: Error) => {
        this.error = 'Gagal mencari anime';
        this.isLoading = false;
        console.error('Error:', err);
      }
    });
  }
}
