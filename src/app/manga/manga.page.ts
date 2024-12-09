import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';  // Add this import
import { ActivatedRoute, Router } from '@angular/router';
import { MangaService } from '../services/manga.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
@Component({
  selector: 'app-manga',
  templateUrl: './manga.page.html',
  styleUrls: ['./manga.page.scss'],
})
export class MangaPage implements OnInit, OnDestroy {
  @ViewChild(IonContent) content?: IonContent;
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
      this.currentPage = params['page'] ? parseInt(params['page'], 10) : 1;
      this.selectedGenre = params['genreId'] ? parseInt(params['genreId'], 10) : undefined;
      this.currentSearchQuery = params['searchQuery'] || '';

      if (this.currentSearchQuery) {
        this.performSearch(this.currentSearchQuery);
      } else if (this.selectedGenre) {
        this.loadManga();
      } else {
        this.loadPopularManga(this.currentPage); 
      }

      this.loadGenres();
    });

    this.setupSearch();
  }
  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
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
      this.loadPopularManga(this.currentPage);
    }
  }

  loadManga(): void {
    this.isLoading = true;
    this.mangaService.getManga(this.selectedGenre, this.currentPage).subscribe({
      next: (response) => {
        this.mangaList = response.data;
        this.totalPages = response.pagination?.last_visible_page || 1;
        this.isLoading = false;
        this.content?.scrollToTop(0);
      },
      error: (err: Error) => {
        this.error = 'Gagal memuat data manga';
        this.isLoading = false;
        console.error('Error:', err);
      }
    });
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
          this.loadPopularManga(this.currentPage);
        }
      }
    });
  }
  
  goToMangaDetail(animeId: number): void {
    this.router.navigate(['/manga', animeId], {
    queryParams: { genreId: this.selectedGenre, page: this.currentPage },
  });
}

  private loadPopularManga(page: number): void { // Tambahkan parameter page
    this.isLoading = true;
    this.mangaService.getPopularManga(page).subscribe({ // Asumsi service sudah dimodifikasi
      next: (response) => {
        this.mangaList = response.data;
        this.totalPages = response.pagination?.last_visible_page || 1;
        this.isLoading = false;
        this.content?.scrollToTop(0);
      },
      error: (err: Error) => {
        this.error = 'Gagal memuat data anime populer';
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
        this.content?.scrollToTop(0);
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

      // Update URL dengan parameter halaman baru
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          page: this.currentPage,
          genreId: this.selectedGenre || null,
          searchQuery: this.currentSearchQuery || null
        },
        queryParamsHandling: 'merge'
      });

      this.content?.scrollToTop(500); // 500ms animation duration
      // Panggil fungsi yang sesuai dengan state saat ini
      if (this.currentSearchQuery) {
        this.performSearch(this.currentSearchQuery);
      } else if (this.selectedGenre) {
        this.loadManga();
      } else {
        this.loadPopularManga(this.currentPage); // Gunakan currentPage
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
