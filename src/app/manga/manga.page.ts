import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  genres: any[] = [];
  selectedGenre?: number;
  isLoading: boolean = false;
  error: string = '';
  currentPage: number = 1;
  totalPages: number = 1;
  
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  private currentSearchQuery: string = '';

  constructor(
    private mangaService: MangaService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
   this.route.queryParams.subscribe(params => {
      if (params['genreId']) {
        this.selectedGenre = parseInt(params['genreId']);
        this.loadManga();
      } else {
        this.loadGenres();
        this.loadPopularManga();
      }
    });
    
    this.setupSearch();
  }

 private loadGenres(): void {
    this.mangaService.getGenres().subscribe({
      next: (response) => {
        this.genres = response.data;
        // Jika ada selectedGenre, update UI select
        if (this.selectedGenre) {
          // Untuk Ionic select, kita perlu memastikan nilai terseleksi
          const selectElement = document.querySelector('ion-select');
          if (selectElement) {
            (selectElement as any).value = this.selectedGenre;
          }
        }
      },
      error: (err) => {
        console.error('Error loading genres:', err);
        this.error = 'Gagal memuat daftar genre';
      }
    });
  }

  onGenreChange(event: CustomEvent): void {
    this.selectedGenre = event.detail.value;
    this.currentPage = 1; // Reset page
    this.currentSearchQuery = ''; // Reset search query
    if (this.selectedGenre) {
      this.loadManga();
    } else {
      this.loadPopularManga();
    }
  }

  loadManga(): void {
    this.isLoading = true;
    this.mangaService.getManga(this.selectedGenre, this.currentPage).subscribe({
      next: (response) => {
        this.mangaList = response.data;
        this.totalPages = response.pagination?.last_visible_page || 1;
        this.isLoading = false;
      },
      error: (err: Error) => {
        this.error = 'Gagal memuat data manga';
        this.isLoading = false;
        console.error('Error:', err);
      }
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  private setupSearch(): void {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(query => {
      this.currentSearchQuery = query;
      this.currentPage = 1; // Reset page when searching
      if (query.length >= 3) {
        this.performSearch(query);
      } else if (query.length === 0) {
        // If search is cleared, go back to either filtered by genre or popular
        if (this.selectedGenre) {
          this.loadManga();
        } else {
          this.loadPopularManga();
        }
      }
    });
  }
  
  goToMangaDetail(mangaId: number) {
    this.router.navigate(['/manga', mangaId]);
  }

  private loadPopularManga(): void {
    this.isLoading = true;
    this.mangaService.getPopularManga(this.currentPage).subscribe({
      next: (response) => {
        this.mangaList = response.data;
        this.totalPages = response.pagination?.last_visible_page || 1;
        this.isLoading = false;
      },
      error: (err: Error) => {
        this.error = 'Gagal memuat data manga populer';
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
    this.mangaService.searchManga(query, this.selectedGenre, this.currentPage).subscribe({
      next: (response) => {
        this.mangaList = response.data;
        this.totalPages = response.pagination?.last_visible_page || 1;
        this.isLoading = false;
      },
      error: (err: Error) => {
        this.error = 'Gagal mencari manga';
        this.isLoading = false;
        console.error('Error:', err);
      }
    });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      if (this.currentSearchQuery) {
        this.performSearch(this.currentSearchQuery);
      } else if (this.selectedGenre) {
        this.loadManga();
      } else {
        this.loadPopularManga();
      }
    }
  }

  getDisplayedPages(): number[] {
    const pagesToShow = 3; // Jumlah halaman di sekitar halaman aktif
    const pages: number[] = [];

    if (this.totalPages <= 1) return pages;

    // Tambahkan halaman pertama
    pages.push(1);

    // Tambahkan halaman awal rentang
    const startPage = Math.max(2, this.currentPage - pagesToShow);
    const endPage = Math.min(this.totalPages - 1, this.currentPage + pagesToShow);

    if (startPage > 2) {
      pages.push(-1); // Tanda "..."
    }

    // Tambahkan halaman di sekitar halaman aktif
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < this.totalPages - 1) {
      pages.push(-1); // Tanda "..."
    }

    // Tambahkan halaman terakhir
    pages.push(this.totalPages);

    return pages;
  }
}
