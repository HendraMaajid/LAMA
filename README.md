# Anime & Manga List App

Aplikasi mobile untuk melihat dan mengelola daftar anime dan manga favorit Anda. Dibuat menggunakan Ionic Framework dengan Angular.

## 📱 Fitur

- Mencari anime dan manga
- Melihat detail anime/manga (sinopsis, rating, genre, dll)
- Menambahkan anime/manga ke daftar bookmark
- Forum diskusi

## 🚀 Teknologi yang Digunakan

- Ionic Framework 8.x
- Angular 18.x
- TypeScript
- SCSS
- Capacitor untuk fitur native
- Local Storage untuk penyimpanan data offline
- [Jikan API](https://jikan.moe/) untuk data anime dan manga

## ⚙️ Prasyarat

Sebelum menjalankan aplikasi ini, pastikan Anda telah menginstall:

- Node.js (versi 14.x atau lebih tinggi)
- npm (versi 6.x atau lebih tinggi)
- Ionic CLI
- Angular CLI
- Android Studio/Visual Studio code

## 🛠️ Instalasi

1. Clone repository ini
```bash
git clone https://github.com/HendraMaajid/LAMA.git
cd LAMA
```

2. Install dependencies
```bash
npm install
```

3. Jalankan aplikasi di browser
```bash
ionic serve
```

## 📱 Build Aplikasi

### Android
```bash
ionic capacitor add android
ionic capacitor copy android
ionic capacitor run android
```

### iOS
```bash
ionic capacitor add ios
ionic capacitor copy ios
ionic capacitor run ios
```

## 📁 Struktur Project

```
src/
├── app/
│   ├── profile/           # profile page
│   ├── anime/           # anime page
│   ├── manga/         # manga page
│   ├── pages/       # list of pages
│   │   ├── anime-detail/      # anime detail pages
│   │   └── manga-detail/      # manga detail pages
│   ├── services/         # Api url for anime and manga
│   └── bookmark/         # bookmark page
├── assets/            # images, icons, etc
├── theme/            # global SCSS files
└── environments/     # environment configurations
```

## 🔑 Konfigurasi

1. Buat file `environment.ts` di folder `src/environments/`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://api.jikan.moe/v4'
};
```

2. Buat file `environment.prod.ts` untuk production:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.jikan.moe/v4'
};
```

## 🤝 Kontribusi

1. Fork repository ini
2. Buat branch baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan Anda (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📝 Lisensi

Distributed under the MIT License. Lihat `LICENSE` untuk informasi lebih lanjut.

## 📞 Kontak

Project Link: [https://github.com/HendraMaajid/LAMA](https://github.com/HendraMaajid/LAMA)