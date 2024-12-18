// src/app/pages/anime-detail/anime-detail.page.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnimeService } from '../../services/anime.service';
import { ForumAnimeService, ForumPost, Reply } from '../../services/forum.anime.service';
import { LoadingController, ModalController, AlertController, ToastController } from '@ionic/angular';
import { AuthenticationService } from '../../services/authentication.service';
import { switchMap } from 'rxjs/operators';
import { EpisodeDetailComponent } from './episode-detail.component'; // Import this
import { BookmarkService } from '../../services/bookmark.service';

@Component({
  selector: 'app-anime-detail',
  templateUrl: './anime-detail.page.html',
  styleUrls: ['./anime-detail.page.scss'],
})
export class AnimeDetailPage implements OnInit {
  animeDetails: any;
  characters: any[] = [];
  episodes: any[] = [];
  forumPosts: ForumPost[] = [];
  isLoading = false;
  error = '';
  selectedSegment = 'info';
  newPostContent = '';
  isUserLoggedIn = false;
  editingPostId: string | null = null;
  editContent = '';
  currentUserId$ = this.forumService.getCurrentUserId();
  postReplies: Map<string, Reply[]> = new Map();
  replyContents: Map<string, string> = new Map();
  showReplies: Map<string, boolean> = new Map();
  isBookmarked = false;

  constructor(
    private route: ActivatedRoute,
    private animeService: AnimeService,
    private forumService: ForumAnimeService,
    private authService: AuthenticationService,
    private router: Router,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController,
    private bookmarkService: BookmarkService
  ) { }

  ngOnInit() {
    const animeId = this.route.snapshot.paramMap.get('id');
     if (animeId) {
    const parsedId = parseInt(animeId, 10);
    this.loadAnimeDetails(parsedId);
    this.animeEpisodes(parsedId);
    this.checkBookmarkStatus(parsedId);

    this.authService.getAuthState().subscribe(user => {
      this.isUserLoggedIn = !!user;
      this.checkBookmarkStatus(parsedId);
    });
      
      // Ganti bagian ini
      this.authService.getAuthState().pipe(
        switchMap(user => {
          this.isUserLoggedIn = !!user;
          return this.forumService.getForumPosts(parsedId);
        })
      ).subscribe({
        next: (posts) => {
          this.forumPosts = posts;
          // Pre-load reply counts for all posts
          posts.forEach(post => {
            if (post.id) this.loadReplies(post.id);
          });
        },
        error: (error) => {
          console.error('Error loading forum posts:', error);
        }
      });
    }
}

  async loadAnimeDetails(id: number) {
    const loading = await this.loadingController.create({
      message: 'Memuat detail anime...'
    });
    await loading.present();

    this.animeService.getAnimeDetails(id).subscribe({
      next: (response) => {
        this.animeDetails = response.data;
        this.loadCharacters(id);
      },
      error: (error) => {
        this.error = 'Gagal memuat detail anime';
        console.error('Error:', error);
        loading.dismiss();
      }
    });
  }

  loadCharacters(id: number) {
    this.animeService.getAnimeCharacters(id).subscribe({
      next: (response) => {
        this.characters = response.data;
        this.loadingController.dismiss();
      },
      error: (error) => {
        this.error = 'Gagal memuat karakter';
        console.error('Error:', error);
        this.loadingController.dismiss();
      }
    });
  }

  animeEpisodes(id: number) {
    this.animeService.getAnimeEpisodes(id).subscribe({
      next: (response) => {
        this.episodes = response.data;
        console.log(response);
      },
      error: (error) => {
        console.error('Error:', error);
      }
    });
  }

  async showEpisodeDetail(animeId: number, episodeNumber: number) {
    const loading = await this.loadingController.create({
      message: 'Loading episode details...'
    });
    await loading.present();

    this.animeService.getAnimeEpisodesbyId(animeId, episodeNumber).subscribe({
      next: async (response) => {
        loading.dismiss();
        const modal = await this.modalController.create({
          component: EpisodeDetailComponent,
          componentProps: {
            episode: response.data
          }
        });
        await modal.present();
      },
      error: (error) => {
        loading.dismiss();
        console.error('Error:', error);
      }
    });
  }

  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  }

  navigateToAnimeList(genre: any) {
    // Navigasi ke halaman anime list dengan parameter genre
    this.router.navigate(['/anime'], {
      queryParams: {
        genreId: genre.mal_id,
        genreName: genre.name
      }
    });
  }

  async createForumPost() {
    if (!this.isUserLoggedIn) {
      await this.showLoginPrompt();
      return;
    }

    if (!this.newPostContent.trim()) return;

    const loading = await this.loadingController.create({
      message: 'Posting comment...'
    });
    await loading.present();

    const animeId = this.route.snapshot.paramMap.get('id');
    if (!animeId) {
      loading.dismiss();
      return;
    }
    
    try {
      await this.forumService.createForumPost({
        animeId: parseInt(animeId, 10),
        content: this.newPostContent
      });
      
      this.newPostContent = '';
      loading.dismiss();
    } catch (error) {
      console.error('Error creating post:', error);
      loading.dismiss();
      
      const alert = await this.alertController.create({
        header: 'Post Failed',
        message: 'Unable to post your comment. Please try again.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  async showLoginPrompt() {
    const alert = await this.alertController.create({
      header: 'Login Required',
      message: 'Please login to use bookmark and forum',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Login',
          handler: () => {
            this.router.navigate(['/login']);
          }
        }
      ]
    });

    await alert.present();
  }

  async showEditDialog(post: ForumPost) {
    if (!await this.forumService.canModifyPost(post.id!)) return;

    const alert = await this.alertController.create({
      header: 'Edit Comment',
      inputs: [
        {
          name: 'content',
          type: 'textarea',
          value: post.content,
          placeholder: 'Edit your comment...'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: (data) => {
            this.updateForumPost(post.id!, data.content);
          }
        }
      ]
    });

    await alert.present();
  }

  async updateForumPost(postId: string, content: string) {
  try {
    await this.forumService.updateForumPost(postId, content);
    // Toast untuk sukses
    const toast = await this.toastController.create({
      message: 'Komentar berhasil diperbarui',
      duration: 2000,
      position: 'top',
      color: 'success'
    });
    await toast.present();
  } catch (error) {
    console.error('Error updating post:', error);
    const toast = await this.toastController.create({
      message: 'Gagal memperbarui komentar',
      duration: 2000,
      position: 'top',
      color: 'danger'
    });
    await toast.present();
  }
}

async deleteForumPost(postId: string) {
  if (!await this.forumService.canModifyPost(postId)) return;

  const alert = await this.alertController.create({
    header: 'Konfirmasi Hapus',
    message: 'Apakah Anda yakin ingin menghapus komentar ini?',
    buttons: [
      {
        text: 'Batal',
        role: 'cancel'
      },
      {
        text: 'Hapus',
        handler: async () => {
          try {
            await this.forumService.deleteForumPost(postId);
            // Toast untuk sukses
            const toast = await this.toastController.create({
              message: 'Komentar berhasil dihapus',
              duration: 2000,
              position: 'top',
              color: 'success'
            });
            await toast.present();
          } catch (error) {
            console.error('Error deleting post:', error);
            const toast = await this.toastController.create({
              message: 'Gagal menghapus komentar',
              duration: 2000,
              position: 'top',
              color: 'danger'
            });
            await toast.present();
          }
        }
      }
    ]
  });

  await alert.present();
}

   // Load replies for a specific post
  loadReplies(postId: string) {
    this.forumService.getReplies(postId).subscribe({
      
      next: (replies) => {
        this.postReplies.set(postId, replies);
      },
      error: (error) => {
        console.error('Error loading replies:', error);
      }
    });
  }

  // Toggle replies visibility
  toggleReplies(postId: string) {
    const currentValue = this.showReplies.get(postId) || false;
    this.showReplies.set(postId, !currentValue);
    
    if (!currentValue && !this.postReplies.has(postId)) {
      this.loadReplies(postId);
    }
  }

  // Create a new reply
  async createReply(postId: string) {
    if (!this.isUserLoggedIn) {
      await this.showLoginPrompt();
      return;
    }

    const replyContent = this.replyContents.get(postId);
    if (!replyContent?.trim()) return;

    const loading = await this.loadingController.create({
      message: 'Posting reply...'
    });
    await loading.present();

    try {
      await this.forumService.createReply(postId, replyContent);
      this.replyContents.set(postId, ''); // Clear input
      loading.dismiss();

      const toast = await this.toastController.create({
        message: 'Reply posted successfully',
        duration: 2000,
        position: 'top',
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      console.error('Error creating reply:', error);
      loading.dismiss();
      
      const alert = await this.alertController.create({
        header: 'Reply Failed',
        message: 'Unable to post your reply. Please try again.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  // Delete a reply
  async deleteReply(postId: string, replyId: string) {
    if (!await this.forumService.canModifyReply(postId, replyId)) return;

    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this reply?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: async () => {
            try {
              await this.forumService.deleteReply(postId, replyId);
              const toast = await this.toastController.create({
                message: 'Reply deleted successfully',
                duration: 2000,
                position: 'top',
                color: 'success'
              });
              await toast.present();
            } catch (error) {
              console.error('Error deleting reply:', error);
              const toast = await this.toastController.create({
                message: 'Failed to delete reply',
                duration: 2000,
                position: 'top',
                color: 'danger'
              });
              await toast.present();
            }
          }
        }
      ]
    });

    await alert.present();
  }
  
  async checkBookmarkStatus(animeId: number) {
    if (this.isUserLoggedIn) {
      this.isBookmarked = await this.bookmarkService.isBookmarked('anime', animeId);
    } else {
      this.isBookmarked = false;
    }
  }

  async toggleBookmark() {
    if (!this.isUserLoggedIn) {
      await this.showLoginPrompt();
      return;
    }

    try {
      const animeId = parseInt(this.route.snapshot.paramMap.get('id')!, 10);
      
      if (this.isBookmarked) {
        await this.bookmarkService.removeBookmark('anime', animeId);
        this.isBookmarked = false;
        
        const toast = await this.toastController.create({
          message: 'Removed from bookmarks',
          duration: 2000,
          position: 'top',
          color: 'success'
        });
        await toast.present();
      } else {
        await this.bookmarkService.addBookmark({
          animeId: animeId,
          type: 'anime',
          title: this.animeDetails.title,
          imageUrl: this.animeDetails.images.webp.large_image_url
        });
        this.isBookmarked = true;
        
        const toast = await this.toastController.create({
          message: 'Added to bookmarks',
          duration: 2000,
          position: 'top',
          color: 'success'
        });
        await toast.present();
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      const toast = await this.toastController.create({
        message: 'Failed to update bookmark',
        duration: 2000,
        position: 'top',
        color: 'danger'
      });
      await toast.present();
    }
  }
}
