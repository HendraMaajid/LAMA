import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AnimeService } from '../services/anime.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-anime',
  templateUrl: './anime.page.html',
  styleUrls: ['./anime.page.scss'],
})
export class AnimePage implements OnInit, OnDestroy {
  animeList: any[] = [];
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
    private animeService: AnimeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadGenres();
    this.loadPopularAnime();
    this.setupSearch();
  }

  private loadPopularAnime(): void {
    this.isLoading = true;
    this.animeService.getPopularAnime().subscribe({
      next: (response) => {
        this.animeList = response.data;
        this.totalPages = response.pagination?.last_visible_page || 1;
        this.isLoading = false;
      },
      error: (err: Error) => {
        this.error = 'Gagal memuat data anime populer';
        this.isLoading = false;
        console.error('Error:', err);
      }
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  private loadGenres(): void {
    this.animeService.getGenres().subscribe({
      next: (response) => {
        this.genres = response.data;
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
    if (this.currentSearchQuery) {
      this.performSearch(this.currentSearchQuery);
    } else if (this.selectedGenre) {
      this.loadAnime();
    } else {
      this.loadPopularAnime();
    }
  }

  private setupSearch(): void {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(query => {
      this.currentSearchQuery = query;
      this.currentPage = 1; // Reset page
      if (query.length >= 3) {
        this.performSearch(query);
      } else if (query.length === 0) {
        if (this.selectedGenre) {
          this.loadAnime();
        } else {
          this.loadPopularAnime();
        }
      }
    });
  }

  loadAnime(): void {
    this.isLoading = true;
    this.animeService.getAnime(this.selectedGenre, this.currentPage).subscribe({
      next: (response) => {
        this.animeList = response.data;
        this.totalPages = response.pagination?.last_visible_page || 1;
        this.isLoading = false;
      },
      error: (err: Error) => {
        this.error = 'Gagal memuat data anime';
        this.isLoading = false;
        console.error('Error:', err);
      }
    });
  }

  onSearchInput(event: CustomEvent): void {
    const query = event.detail.value?.trim() || '';
    this.searchSubject.next(query);
  }

  private performSearch(query: string): void {
    this.isLoading = true;
    this.animeService.searchAnime(query, this.selectedGenre, this.currentPage).subscribe({
      next: (response) => {
        this.animeList = response.data;
        this.totalPages = response.pagination?.last_visible_page || 1;
        this.isLoading = false;
      },
      error: (err: Error) => {
        this.error = 'Gagal mencari anime';
        this.isLoading = false;
        console.error('Error:', err);
      }
    });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadAnime(); // Memuat anime untuk halaman saat ini
    }
  }

  goToAnimeDetail(animeId: number) {
    this.router.navigate(['/anime', animeId]);
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
